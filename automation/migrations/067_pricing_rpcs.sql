-- Migration 067: Pricing RPCs (get_quote + get_bundle_quote)
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Two core pricing functions that encode all TotalGuard business rules:
--   multiplicative multiplier stacking, 30% discount cap, seasonal checks,
--   per-unit minimums, flat-fee travel surcharges, and bundle discounts.

-- ============================================================
-- Function 1: get_quote()
-- Returns a JSONB quote for a single service with multiplier stacking.
-- ============================================================
CREATE OR REPLACE FUNCTION get_quote(
  p_service_slug TEXT,
  p_tier TEXT DEFAULT 'good',
  p_size_key TEXT DEFAULT 'medium',
  p_multiplier_slugs TEXT[] DEFAULT '{}',
  p_quantity INTEGER DEFAULT NULL,
  p_price_type TEXT DEFAULT NULL  -- NULL = auto-detect; or 'per-push', 'seasonal', 'annual', etc.
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_service RECORD;
  v_rate RECORD;
  v_base_price NUMERIC;
  v_surcharge_multiplier NUMERIC := 1.0;
  v_discount_multiplier NUMERIC := 1.0;
  v_flat_fees NUMERIC := 0;
  v_multiplier RECORD;
  v_final_price NUMERIC;
  v_applied_multipliers JSONB := '[]'::jsonb;
  v_price_type TEXT;
  v_includes TEXT[];
  v_price_max NUMERIC;
  v_current_month INTEGER;
  v_is_recurring BOOLEAN := FALSE;
  v_minimum_applied BOOLEAN := FALSE;
  v_rate_count INTEGER;
BEGIN
  -- -------------------------------------------------------
  -- 1. Look up service
  -- -------------------------------------------------------
  SELECT * INTO v_service
  FROM pricing_services
  WHERE slug = p_service_slug AND is_active = TRUE;

  IF v_service IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Service not found or inactive',
      'service', p_service_slug
    );
  END IF;

  -- -------------------------------------------------------
  -- 2. Check seasonal availability
  -- -------------------------------------------------------
  v_current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;

  IF v_service.seasonal_only THEN
    IF v_service.season_start_month <= v_service.season_end_month THEN
      -- Normal range (e.g., Mar=3 to May=5)
      IF v_current_month < v_service.season_start_month
         OR v_current_month > v_service.season_end_month THEN
        RETURN jsonb_build_object(
          'error', 'Service not available this season',
          'service', p_service_slug,
          'service_name', v_service.name,
          'available_months', jsonb_build_object(
            'start', v_service.season_start_month,
            'end', v_service.season_end_month
          )
        );
      END IF;
    ELSE
      -- Wrap-around range (e.g., Nov=11 to Mar=3 for snow removal)
      IF v_current_month < v_service.season_start_month
         AND v_current_month > v_service.season_end_month THEN
        RETURN jsonb_build_object(
          'error', 'Service not available this season',
          'service', p_service_slug,
          'service_name', v_service.name,
          'available_months', jsonb_build_object(
            'start', v_service.season_start_month,
            'end', v_service.season_end_month
          )
        );
      END IF;
    END IF;
  END IF;

  -- -------------------------------------------------------
  -- 3. Determine base price based on pricing_model
  -- -------------------------------------------------------

  IF v_service.pricing_model IN ('fixed', 'per-visit', 'per-push', 'seasonal') THEN
    -- For snow-removal with no price_type specified, require caller to choose
    IF p_service_slug = 'snow-removal' AND p_price_type IS NULL THEN
      -- Count distinct price_types for this service+tier+size
      SELECT COUNT(DISTINCT price_type) INTO v_rate_count
      FROM pricing_rates
      WHERE service_id = v_service.id AND tier = p_tier AND size_key = p_size_key;

      IF v_rate_count > 1 THEN
        RETURN jsonb_build_object(
          'error', 'Multiple price types available for snow-removal. Please specify p_price_type.',
          'service', p_service_slug,
          'available_price_types', (
            SELECT jsonb_agg(DISTINCT price_type)
            FROM pricing_rates
            WHERE service_id = v_service.id AND tier = p_tier AND size_key = p_size_key
          )
        );
      END IF;
    END IF;

    -- Try to find rate with explicit price_type if provided
    IF p_price_type IS NOT NULL THEN
      SELECT * INTO v_rate
      FROM pricing_rates
      WHERE service_id = v_service.id
        AND tier = p_tier
        AND size_key = p_size_key
        AND price_type = p_price_type
      LIMIT 1;
    ELSE
      -- Default: try 'one-time' first, then 'per-visit', then any
      SELECT * INTO v_rate
      FROM pricing_rates
      WHERE service_id = v_service.id
        AND tier = p_tier
        AND size_key = p_size_key
        AND price_type IN ('one-time', 'per-visit')
      ORDER BY CASE price_type WHEN 'per-visit' THEN 1 WHEN 'one-time' THEN 2 END
      LIMIT 1;

      -- If none, try any price_type
      IF v_rate IS NULL THEN
        SELECT * INTO v_rate
        FROM pricing_rates
        WHERE service_id = v_service.id
          AND tier = p_tier
          AND size_key = p_size_key
        ORDER BY CASE price_type
          WHEN 'per-visit' THEN 1
          WHEN 'one-time' THEN 2
          WHEN 'annual' THEN 3
          WHEN 'seasonal' THEN 4
          WHEN 'per-push' THEN 5
          WHEN 'monthly' THEN 6
          ELSE 7
        END
        LIMIT 1;
      END IF;
    END IF;

    IF v_rate IS NULL THEN
      RETURN jsonb_build_object(
        'error', 'No rate found',
        'service', p_service_slug,
        'tier', p_tier,
        'size_key', p_size_key,
        'price_type', p_price_type
      );
    END IF;

    v_base_price := v_rate.price;
    v_price_type := v_rate.price_type;
    v_includes := v_rate.includes;
    v_price_max := v_rate.price_max;

  ELSIF v_service.pricing_model = 'per-unit' THEN
    -- Specialty per-unit services: price = per_unit_price x quantity
    IF p_quantity IS NULL OR p_quantity < 1 THEN
      RETURN jsonb_build_object(
        'error', 'Quantity required for per-unit service',
        'service', p_service_slug,
        'per_unit_price', v_service.per_unit_price,
        'per_unit_label', v_service.per_unit_label,
        'minimum', v_service.minimum_one_time
      );
    END IF;

    v_base_price := v_service.per_unit_price * p_quantity;
    v_price_type := 'per-unit';
    v_includes := NULL;

    -- Enforce minimum BEFORE multipliers for per-unit
    IF v_service.minimum_one_time IS NOT NULL AND v_base_price < v_service.minimum_one_time THEN
      v_base_price := v_service.minimum_one_time;
      v_minimum_applied := TRUE;
    END IF;

  ELSIF v_service.pricing_model = 'hourly' THEN
    -- Hourly services: return hourly rate info
    v_base_price := v_service.hourly_rate;
    v_price_type := 'hourly';

    SELECT * INTO v_rate
    FROM pricing_rates
    WHERE service_id = v_service.id
      AND tier = p_tier
      AND size_key = COALESCE(p_size_key, 'standard')
    LIMIT 1;

    IF v_rate IS NOT NULL THEN
      v_includes := v_rate.includes;
    END IF;

  ELSIF v_service.pricing_model = 'custom' THEN
    RETURN jsonb_build_object(
      'error', 'Custom quote required - contact for estimate',
      'service', p_service_slug,
      'service_name', v_service.name,
      'pricing_model', 'custom'
    );

  ELSE
    RETURN jsonb_build_object(
      'error', 'Unknown pricing model',
      'service', p_service_slug,
      'pricing_model', v_service.pricing_model
    );
  END IF;

  -- -------------------------------------------------------
  -- 4. Apply multipliers (multiplicative stacking)
  -- -------------------------------------------------------
  -- Check if recurring is in the list
  v_is_recurring := 'recurring-member' = ANY(p_multiplier_slugs);

  IF array_length(p_multiplier_slugs, 1) > 0 THEN
    FOR v_multiplier IN
      SELECT * FROM pricing_multipliers
      WHERE slug = ANY(p_multiplier_slugs)
      ORDER BY sort_order
    LOOP
      -- Check if this multiplier applies to the service
      IF 'all' = ANY(v_multiplier.applies_to)
         OR p_service_slug = ANY(v_multiplier.applies_to) THEN

        IF v_multiplier.multiplier_type = 'surcharge' AND v_multiplier.multiplier IS NOT NULL THEN
          v_surcharge_multiplier := v_surcharge_multiplier * v_multiplier.multiplier;
        ELSIF v_multiplier.multiplier_type = 'discount' AND v_multiplier.multiplier IS NOT NULL THEN
          v_discount_multiplier := v_discount_multiplier * v_multiplier.multiplier;
        ELSIF v_multiplier.multiplier_type = 'flat-fee' AND v_multiplier.flat_amount IS NOT NULL THEN
          v_flat_fees := v_flat_fees + v_multiplier.flat_amount;
        END IF;

        v_applied_multipliers := v_applied_multipliers || jsonb_build_object(
          'slug', v_multiplier.slug,
          'name', v_multiplier.name,
          'type', v_multiplier.multiplier_type,
          'value', COALESCE(v_multiplier.multiplier, 0),
          'flat', COALESCE(v_multiplier.flat_amount, 0)
        );
      END IF;
    END LOOP;
  END IF;

  -- -------------------------------------------------------
  -- 5. Cap discount at 30% max (discount_multiplier >= 0.70)
  -- -------------------------------------------------------
  IF v_discount_multiplier < 0.70 THEN
    v_discount_multiplier := 0.70;
  END IF;

  -- -------------------------------------------------------
  -- 6. Calculate final: base x surcharges x discounts + flat fees
  -- -------------------------------------------------------
  v_final_price := v_base_price * v_surcharge_multiplier * v_discount_multiplier + v_flat_fees;

  -- -------------------------------------------------------
  -- 7. Enforce minimum (after multipliers, for fixed/per-visit pricing)
  -- -------------------------------------------------------
  IF v_service.pricing_model IN ('fixed', 'per-visit') THEN
    IF v_is_recurring AND v_service.minimum_recurring IS NOT NULL THEN
      IF v_final_price < v_service.minimum_recurring THEN
        v_final_price := v_service.minimum_recurring;
        v_minimum_applied := TRUE;
      END IF;
    ELSIF v_service.minimum_one_time IS NOT NULL AND v_final_price < v_service.minimum_one_time THEN
      v_final_price := v_service.minimum_one_time;
      v_minimum_applied := TRUE;
    END IF;
  END IF;

  -- -------------------------------------------------------
  -- 8. Round to nearest $5 (ONCE, at the end)
  -- -------------------------------------------------------
  v_final_price := ROUND(v_final_price / 5.0) * 5;

  -- -------------------------------------------------------
  -- 9. Build response
  -- -------------------------------------------------------
  RETURN jsonb_build_object(
    'service', p_service_slug,
    'service_name', v_service.name,
    'tier', p_tier,
    'size', p_size_key,
    'base_price', v_base_price,
    'surcharge_multiplier', v_surcharge_multiplier,
    'discount_multiplier', v_discount_multiplier,
    'flat_fees', v_flat_fees,
    'final_price', v_final_price,
    'price_type', v_price_type,
    'includes', COALESCE(to_jsonb(v_includes), '[]'::jsonb),
    'multipliers_applied', v_applied_multipliers,
    'minimum_applied', v_minimum_applied,
    'price_max', v_price_max,
    'pricing_model', v_service.pricing_model,
    'quantity', p_quantity,
    'per_unit_price', v_service.per_unit_price,
    'per_unit_label', v_service.per_unit_label
  );
END;
$$;

-- ============================================================
-- Function 2: get_bundle_quote()
-- Returns a JSONB bundle quote with itemized prices + bundle discount.
-- ============================================================
CREATE OR REPLACE FUNCTION get_bundle_quote(
  p_bundle_slug TEXT DEFAULT NULL,
  p_services JSONB DEFAULT NULL,
  p_multiplier_slugs TEXT[] DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_bundle RECORD;
  v_discount_pct NUMERIC;
  v_bundle_name TEXT;
  v_service JSONB;
  v_quote JSONB;
  v_undiscounted_quote JSONB;
  v_items JSONB := '[]'::jsonb;
  v_subtotal NUMERIC := 0;
  v_undiscounted_subtotal NUMERIC := 0;
  v_discount_amount NUMERIC;
  v_final_total NUMERIC;
  v_service_count INTEGER;
BEGIN
  -- -------------------------------------------------------
  -- 1. Determine discount percentage
  -- -------------------------------------------------------
  IF p_bundle_slug IS NOT NULL THEN
    SELECT * INTO v_bundle
    FROM pricing_bundles
    WHERE slug = p_bundle_slug AND is_active = TRUE;

    IF v_bundle IS NULL THEN
      RETURN jsonb_build_object('error', 'Bundle not found or inactive', 'bundle', p_bundle_slug);
    END IF;

    v_discount_pct := v_bundle.discount_percent;
    v_bundle_name := v_bundle.name;
  ELSE
    v_bundle_name := 'Custom Bundle';
  END IF;

  -- Validate services input
  IF p_services IS NULL OR jsonb_array_length(p_services) < 2 THEN
    RETURN jsonb_build_object('error', 'Bundle requires at least 2 services in p_services array');
  END IF;

  v_service_count := jsonb_array_length(p_services);

  -- Ad-hoc discount tiers (only if no named bundle)
  IF p_bundle_slug IS NULL THEN
    v_discount_pct := CASE
      WHEN v_service_count = 2 THEN 10.0
      WHEN v_service_count = 3 THEN 12.0
      ELSE 15.0  -- 4+
    END;
  END IF;

  -- -------------------------------------------------------
  -- 2. Quote each service
  -- -------------------------------------------------------
  FOR v_service IN SELECT value FROM jsonb_array_elements(p_services)
  LOOP
    -- Get quote WITH multipliers (may include recurring discount etc.)
    v_quote := get_quote(
      v_service->>'slug',
      COALESCE(v_service->>'tier', 'good'),
      COALESCE(v_service->>'size', 'medium'),
      p_multiplier_slugs,
      (v_service->>'quantity')::INTEGER,
      v_service->>'price_type'
    );

    -- Propagate errors immediately
    IF v_quote ? 'error' THEN
      RETURN v_quote;
    END IF;

    v_items := v_items || jsonb_build_array(v_quote);
    v_subtotal := v_subtotal + (v_quote->>'final_price')::NUMERIC;

    -- Also get undiscounted quote (no multipliers) for global cap check
    v_undiscounted_quote := get_quote(
      v_service->>'slug',
      COALESCE(v_service->>'tier', 'good'),
      COALESCE(v_service->>'size', 'medium'),
      '{}',  -- empty multipliers
      (v_service->>'quantity')::INTEGER,
      v_service->>'price_type'
    );

    IF NOT (v_undiscounted_quote ? 'error') THEN
      v_undiscounted_subtotal := v_undiscounted_subtotal + (v_undiscounted_quote->>'final_price')::NUMERIC;
    END IF;
  END LOOP;

  -- -------------------------------------------------------
  -- 3. Apply bundle discount to subtotal
  -- -------------------------------------------------------
  v_discount_amount := v_subtotal * (v_discount_pct / 100.0);
  v_final_total := v_subtotal - v_discount_amount;

  -- -------------------------------------------------------
  -- 4. Enforce global 30% discount cap
  -- If final_total < 0.70 x undiscounted_subtotal, clamp
  -- -------------------------------------------------------
  IF v_undiscounted_subtotal > 0 AND v_final_total < (0.70 * v_undiscounted_subtotal) THEN
    v_final_total := 0.70 * v_undiscounted_subtotal;
  END IF;

  -- -------------------------------------------------------
  -- 5. Round to nearest $5
  -- -------------------------------------------------------
  v_final_total := ROUND(v_final_total / 5.0) * 5;

  -- Recalculate discount_amount after capping/rounding
  v_discount_amount := v_subtotal - v_final_total;

  -- -------------------------------------------------------
  -- 6. Return result
  -- -------------------------------------------------------
  RETURN jsonb_build_object(
    'bundle', COALESCE(p_bundle_slug, 'ad-hoc'),
    'bundle_name', v_bundle_name,
    'items', v_items,
    'subtotal', v_subtotal,
    'discount_percent', v_discount_pct,
    'discount_amount', v_discount_amount,
    'final_total', v_final_total,
    'service_count', v_service_count,
    'undiscounted_subtotal', v_undiscounted_subtotal
  );
END;
$$;
