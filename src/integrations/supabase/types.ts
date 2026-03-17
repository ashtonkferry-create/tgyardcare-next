export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ab_test_conversions: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          page_path: string
          test_id: string
          variant_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          page_path: string
          test_id: string
          variant_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          page_path?: string
          test_id?: string
          variant_id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      ab_test_impressions: {
        Row: {
          created_at: string | null
          id: string
          page_path: string
          test_id: string
          variant_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_path: string
          test_id: string
          variant_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_path?: string
          test_id?: string
          variant_id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      ab_test_sends: {
        Row: {
          channel: string
          clicked: boolean | null
          conversion_event: string | null
          converted: boolean | null
          created_at: string | null
          delivered: boolean | null
          id: string
          opened: boolean | null
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          test_id: string
          variant_id: string
        }
        Insert: {
          channel: string
          clicked?: boolean | null
          conversion_event?: string | null
          converted?: boolean | null
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          opened?: boolean | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          test_id: string
          variant_id: string
        }
        Update: {
          channel?: string
          clicked?: boolean | null
          conversion_event?: string | null
          converted?: boolean | null
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          opened?: boolean | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          test_id?: string
          variant_id?: string
        }
        Relationships: []
      }
      ab_test_variants: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          test_id: string
          title: string
          weight: number
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id: string
          test_id: string
          title: string
          weight?: number
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          test_id?: string
          title?: string
          weight?: number
        }
        Relationships: []
      }
      ab_tests: {
        Row: {
          auto_winner: boolean | null
          channel: string | null
          created_at: string | null
          id: string
          min_sends_per_variant: number | null
          post_path: string
          status: string
          test_type: string
          updated_at: string | null
          winner_declared_at: string | null
          winner_variant_id: string | null
        }
        Insert: {
          auto_winner?: boolean | null
          channel?: string | null
          created_at?: string | null
          id: string
          min_sends_per_variant?: number | null
          post_path: string
          status?: string
          test_type?: string
          updated_at?: string | null
          winner_declared_at?: string | null
          winner_variant_id?: string | null
        }
        Update: {
          auto_winner?: boolean | null
          channel?: string | null
          created_at?: string | null
          id?: string
          min_sends_per_variant?: number | null
          post_path?: string
          status?: string
          test_type?: string
          updated_at?: string | null
          winner_declared_at?: string | null
          winner_variant_id?: string | null
        }
        Relationships: []
      }
      account_balance_history: {
        Row: {
          account_id: string | null
          balance_cents: number
          balance_dollars: number | null
          created_at: string | null
          id: string
          sequence_id: string
          snapshot_date: string
          snapshot_time: string
        }
        Insert: {
          account_id?: string | null
          balance_cents: number
          balance_dollars?: number | null
          created_at?: string | null
          id?: string
          sequence_id: string
          snapshot_date?: string
          snapshot_time?: string
        }
        Update: {
          account_id?: string | null
          balance_cents?: number
          balance_dollars?: number | null
          created_at?: string | null
          id?: string
          sequence_id?: string
          snapshot_date?: string
          snapshot_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balance_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "sequence_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_campaigns: {
        Row: {
          auto_generated: boolean | null
          budget: number | null
          campaign_name: string
          campaign_type: string | null
          created_at: string | null
          daily_budget: number | null
          end_date: string | null
          external_campaign_id: string | null
          id: string
          objective: string | null
          platform: string
          roas: number | null
          service_type: string | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          target_zip_codes: string[] | null
          template_id: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          total_revenue: number | null
          total_spend: number | null
          updated_at: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          budget?: number | null
          campaign_name: string
          campaign_type?: string | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          external_campaign_id?: string | null
          id?: string
          objective?: string | null
          platform: string
          roas?: number | null
          service_type?: string | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          target_zip_codes?: string[] | null
          template_id?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_revenue?: number | null
          total_spend?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          budget?: number | null
          campaign_name?: string
          campaign_type?: string | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          external_campaign_id?: string | null
          id?: string
          objective?: string | null
          platform?: string
          roas?: number | null
          service_type?: string | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          target_zip_codes?: string[] | null
          template_id?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_revenue?: number | null
          total_spend?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cpc: number | null
          created_at: string | null
          cta_text: string | null
          ctr: number | null
          description: string | null
          display_url: string | null
          external_ad_id: string | null
          final_url: string | null
          headline: string
          id: string
          impressions: number | null
          media_asset_id: string | null
          quality_score: number | null
          revenue: number | null
          roas: number | null
          spend: number | null
          status: string | null
          updated_at: string | null
          variant_label: string | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string | null
          cta_text?: string | null
          ctr?: number | null
          description?: string | null
          display_url?: string | null
          external_ad_id?: string | null
          final_url?: string | null
          headline: string
          id?: string
          impressions?: number | null
          media_asset_id?: string | null
          quality_score?: number | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          variant_label?: string | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string | null
          cta_text?: string | null
          ctr?: number | null
          description?: string | null
          display_url?: string | null
          external_ad_id?: string | null
          final_url?: string | null
          headline?: string
          id?: string
          impressions?: number | null
          media_asset_id?: string | null
          quality_score?: number | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_pending_approval"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_performance_daily: {
        Row: {
          ad_creative_id: string
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cpc: number | null
          ctr: number | null
          id: string
          impressions: number | null
          metric_date: string
          revenue: number | null
          spend: number | null
        }
        Insert: {
          ad_creative_id: string
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date: string
          revenue?: number | null
          spend?: number | null
        }
        Update: {
          ad_creative_id?: string
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date?: string
          revenue?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_daily_ad_creative_id_fkey"
            columns: ["ad_creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_performance_daily_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_performance_daily_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_booking_slots: {
        Row: {
          created_at: string | null
          current_jobs: number | null
          id: string
          is_available: boolean | null
          max_jobs: number | null
          slot_date: string
          slot_label: string
          slot_time_end: string
          slot_time_start: string
        }
        Insert: {
          created_at?: string | null
          current_jobs?: number | null
          id?: string
          is_available?: boolean | null
          max_jobs?: number | null
          slot_date: string
          slot_label: string
          slot_time_end: string
          slot_time_start: string
        }
        Update: {
          created_at?: string | null
          current_jobs?: number | null
          id?: string
          is_available?: boolean | null
          max_jobs?: number | null
          slot_date?: string
          slot_label?: string
          slot_time_end?: string
          slot_time_start?: string
        }
        Relationships: []
      }
      ai_house_size_estimates: {
        Row: {
          created_at: string | null
          default_stories: number | null
          display_name: string
          gutter_linear_ft_estimate: number
          id: string
          lot_sqft_estimate: number
          size_category: string
          sqft_estimate: number
        }
        Insert: {
          created_at?: string | null
          default_stories?: number | null
          display_name: string
          gutter_linear_ft_estimate: number
          id?: string
          lot_sqft_estimate: number
          size_category: string
          sqft_estimate: number
        }
        Update: {
          created_at?: string | null
          default_stories?: number | null
          display_name?: string
          gutter_linear_ft_estimate?: number
          id?: string
          lot_sqft_estimate?: number
          size_category?: string
          sqft_estimate?: number
        }
        Relationships: []
      }
      ai_package_tiers: {
        Row: {
          id: string
          includes: string[] | null
          price_multiplier: number
          service_type: string
          tier_label: string
          tier_name: string
        }
        Insert: {
          id?: string
          includes?: string[] | null
          price_multiplier?: number
          service_type: string
          tier_label: string
          tier_name: string
        }
        Update: {
          id?: string
          includes?: string[] | null
          price_multiplier?: number
          service_type?: string
          tier_label?: string
          tier_name?: string
        }
        Relationships: []
      }
      ai_quotes: {
        Row: {
          additional_services: string[] | null
          appointment_booked: boolean | null
          booked_date: string | null
          booked_time_slot: string | null
          bundle_discount_amount: number | null
          bundle_discount_percent: number | null
          call_id: string | null
          caller_email: string | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          expires_at: string | null
          final_price: number
          id: string
          jobber_customer_id: string | null
          jobber_job_id: string | null
          lot_sqft: number | null
          package_tier: string | null
          preferred_date: string | null
          preferred_time_slot: string | null
          primary_service: string
          property_address: string | null
          property_city: string | null
          property_size: string | null
          property_sqft: number | null
          property_state: string | null
          property_type: string | null
          property_zip: string | null
          quote_accepted: boolean | null
          service_breakdown: Json | null
          status: string | null
          stories: number | null
          subtotal: number | null
          synced_at: string | null
          synced_to_jobber: boolean | null
          updated_at: string | null
        }
        Insert: {
          additional_services?: string[] | null
          appointment_booked?: boolean | null
          booked_date?: string | null
          booked_time_slot?: string | null
          bundle_discount_amount?: number | null
          bundle_discount_percent?: number | null
          call_id?: string | null
          caller_email?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          expires_at?: string | null
          final_price: number
          id?: string
          jobber_customer_id?: string | null
          jobber_job_id?: string | null
          lot_sqft?: number | null
          package_tier?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          primary_service: string
          property_address?: string | null
          property_city?: string | null
          property_size?: string | null
          property_sqft?: number | null
          property_state?: string | null
          property_type?: string | null
          property_zip?: string | null
          quote_accepted?: boolean | null
          service_breakdown?: Json | null
          status?: string | null
          stories?: number | null
          subtotal?: number | null
          synced_at?: string | null
          synced_to_jobber?: boolean | null
          updated_at?: string | null
        }
        Update: {
          additional_services?: string[] | null
          appointment_booked?: boolean | null
          booked_date?: string | null
          booked_time_slot?: string | null
          bundle_discount_amount?: number | null
          bundle_discount_percent?: number | null
          call_id?: string | null
          caller_email?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          expires_at?: string | null
          final_price?: number
          id?: string
          jobber_customer_id?: string | null
          jobber_job_id?: string | null
          lot_sqft?: number | null
          package_tier?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          primary_service?: string
          property_address?: string | null
          property_city?: string | null
          property_size?: string | null
          property_sqft?: number | null
          property_state?: string | null
          property_type?: string | null
          property_zip?: string | null
          quote_accepted?: boolean | null
          service_breakdown?: Json | null
          status?: string | null
          stories?: number | null
          subtotal?: number | null
          synced_at?: string | null
          synced_to_jobber?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_service_pricing: {
        Row: {
          base_price_per_unit: number
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_price: number | null
          pricing_model: string
          pricing_unit: string
          season_end_month: number | null
          season_start_month: number | null
          seasonal_only: boolean | null
          service_description: string | null
          service_name: string
          service_type: string
          updated_at: string | null
        }
        Insert: {
          base_price_per_unit: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_price?: number | null
          pricing_model: string
          pricing_unit: string
          season_end_month?: number | null
          season_start_month?: number | null
          seasonal_only?: boolean | null
          service_description?: string | null
          service_name: string
          service_type: string
          updated_at?: string | null
        }
        Update: {
          base_price_per_unit?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_price?: number | null
          pricing_model?: string
          pricing_unit?: string
          season_end_month?: number | null
          season_start_month?: number | null
          seasonal_only?: boolean | null
          service_description?: string | null
          service_name?: string
          service_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_story_multipliers: {
        Row: {
          label: string
          multiplier: number
          stories: number
        }
        Insert: {
          label: string
          multiplier: number
          stories: number
        }
        Update: {
          label?: string
          multiplier?: number
          stories?: number
        }
        Relationships: []
      }
      ai_visibility_checks: {
        Row: {
          ai_platform: string
          checked_at: string | null
          competitors_mentioned: string[] | null
          date: string
          id: string
          mention_position: string | null
          mentioned: boolean | null
          query: string
          response_quality: string | null
          response_text: string | null
          sentiment: string | null
        }
        Insert: {
          ai_platform: string
          checked_at?: string | null
          competitors_mentioned?: string[] | null
          date?: string
          id?: string
          mention_position?: string | null
          mentioned?: boolean | null
          query: string
          response_quality?: string | null
          response_text?: string | null
          sentiment?: string | null
        }
        Update: {
          ai_platform?: string
          checked_at?: string | null
          competitors_mentioned?: string[] | null
          date?: string
          id?: string
          mention_position?: string | null
          mentioned?: boolean | null
          query?: string
          response_quality?: string | null
          response_text?: string | null
          sentiment?: string | null
        }
        Relationships: []
      }
      asset_promotions: {
        Row: {
          asset_id: string | null
          backlinks_from_promotion: number | null
          channel: string | null
          clicks: number | null
          completed_at: string | null
          conversions: number | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          impressions: number | null
          promotion_type: string
          started_at: string | null
          status: string | null
          target_audience: string | null
          target_list_id: number | null
        }
        Insert: {
          asset_id?: string | null
          backlinks_from_promotion?: number | null
          channel?: string | null
          clicks?: number | null
          completed_at?: string | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          promotion_type: string
          started_at?: string | null
          status?: string | null
          target_audience?: string | null
          target_list_id?: number | null
        }
        Update: {
          asset_id?: string | null
          backlinks_from_promotion?: number | null
          channel?: string | null
          clicks?: number | null
          completed_at?: string | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          promotion_type?: string
          started_at?: string | null
          status?: string | null
          target_audience?: string | null
          target_list_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_promotions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_promotions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "linkable_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_campaign_schedule: {
        Row: {
          auto_fire: boolean | null
          created_at: string | null
          fire_day: number | null
          id: string
          is_active: boolean | null
          last_fired_at: string | null
          month: number
          next_fire_at: string | null
          notes: string | null
          target_service_types: string[] | null
          template_id: string | null
          trigger_name: string
        }
        Insert: {
          auto_fire?: boolean | null
          created_at?: string | null
          fire_day?: number | null
          id?: string
          is_active?: boolean | null
          last_fired_at?: string | null
          month: number
          next_fire_at?: string | null
          notes?: string | null
          target_service_types?: string[] | null
          template_id?: string | null
          trigger_name: string
        }
        Update: {
          auto_fire?: boolean | null
          created_at?: string | null
          fire_day?: number | null
          id?: string
          is_active?: boolean | null
          last_fired_at?: string | null
          month?: number
          next_fire_at?: string | null
          notes?: string | null
          target_service_types?: string[] | null
          template_id?: string | null
          trigger_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_campaign_schedule_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          schedule: string | null
          slug: string
          tier: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          schedule?: string | null
          slug: string
          tier: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          schedule?: string | null
          slug?: string
          tier?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          automation_slug: string
          completed_at: string | null
          error_message: string | null
          id: string
          pages_affected: number
          result_summary: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          automation_slug: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          pages_affected?: number
          result_summary?: string | null
          started_at?: string | null
          status: string
        }
        Update: {
          automation_slug?: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          pages_affected?: number
          result_summary?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automation_slug_fkey"
            columns: ["automation_slug"]
            isOneToOne: false
            referencedRelation: "automation_config"
            referencedColumns: ["slug"]
          },
        ]
      }
      backlink_checks: {
        Row: {
          alert_sent: boolean | null
          backlink_id: string | null
          check_date: string | null
          check_result: string
          created_at: string | null
          found_anchor_text: string | null
          found_link: boolean | null
          found_link_type: string | null
          http_status: number | null
          id: string
          response_time_ms: number | null
        }
        Insert: {
          alert_sent?: boolean | null
          backlink_id?: string | null
          check_date?: string | null
          check_result: string
          created_at?: string | null
          found_anchor_text?: string | null
          found_link?: boolean | null
          found_link_type?: string | null
          http_status?: number | null
          id?: string
          response_time_ms?: number | null
        }
        Update: {
          alert_sent?: boolean | null
          backlink_id?: string | null
          check_date?: string | null
          check_result?: string
          created_at?: string | null
          found_anchor_text?: string | null
          found_link?: boolean | null
          found_link_type?: string | null
          http_status?: number | null
          id?: string
          response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backlink_checks_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks"
            referencedColumns: ["id"]
          },
        ]
      }
      backlink_reports: {
        Row: {
          alerts: Json | null
          avg_domain_authority: number | null
          by_method: Json | null
          created_at: string | null
          dofollow_count: number | null
          id: string
          lost_backlinks: number | null
          net_change: number | null
          new_backlinks: number | null
          nofollow_count: number | null
          report_date: string | null
          report_sent: boolean | null
          report_type: string
          sent_at: string | null
          summary_text: string | null
          top_new_backlinks: Json | null
          total_backlinks: number | null
          total_referring_domains: number | null
        }
        Insert: {
          alerts?: Json | null
          avg_domain_authority?: number | null
          by_method?: Json | null
          created_at?: string | null
          dofollow_count?: number | null
          id?: string
          lost_backlinks?: number | null
          net_change?: number | null
          new_backlinks?: number | null
          nofollow_count?: number | null
          report_date?: string | null
          report_sent?: boolean | null
          report_type: string
          sent_at?: string | null
          summary_text?: string | null
          top_new_backlinks?: Json | null
          total_backlinks?: number | null
          total_referring_domains?: number | null
        }
        Update: {
          alerts?: Json | null
          avg_domain_authority?: number | null
          by_method?: Json | null
          created_at?: string | null
          dofollow_count?: number | null
          id?: string
          lost_backlinks?: number | null
          net_change?: number | null
          new_backlinks?: number | null
          nofollow_count?: number | null
          report_date?: string | null
          report_sent?: boolean | null
          report_type?: string
          sent_at?: string | null
          summary_text?: string | null
          top_new_backlinks?: Json | null
          total_backlinks?: number | null
          total_referring_domains?: number | null
        }
        Relationships: []
      }
      backlinks: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          acquisition_method: string
          anchor_text: string | null
          check_failures: number | null
          created_at: string | null
          first_seen_at: string | null
          id: string
          is_live: boolean | null
          last_checked_at: string | null
          last_seen_live_at: string | null
          link_context: string | null
          link_lost_at: string | null
          link_type: string
          notes: string | null
          related_opportunity_id: string | null
          source_domain: string
          source_domain_authority: number | null
          source_page_authority: number | null
          source_spam_score: number | null
          source_traffic_estimate: number | null
          source_url: string
          target_page: string | null
          target_url: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          acquisition_method: string
          anchor_text?: string | null
          check_failures?: number | null
          created_at?: string | null
          first_seen_at?: string | null
          id?: string
          is_live?: boolean | null
          last_checked_at?: string | null
          last_seen_live_at?: string | null
          link_context?: string | null
          link_lost_at?: string | null
          link_type: string
          notes?: string | null
          related_opportunity_id?: string | null
          source_domain: string
          source_domain_authority?: number | null
          source_page_authority?: number | null
          source_spam_score?: number | null
          source_traffic_estimate?: number | null
          source_url: string
          target_page?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          acquisition_method?: string
          anchor_text?: string | null
          check_failures?: number | null
          created_at?: string | null
          first_seen_at?: string | null
          id?: string
          is_live?: boolean | null
          last_checked_at?: string | null
          last_seen_live_at?: string | null
          link_context?: string | null
          link_lost_at?: string | null
          link_type?: string
          notes?: string | null
          related_opportunity_id?: string | null
          source_domain?: string
          source_domain_authority?: number | null
          source_page_authority?: number | null
          source_spam_score?: number | null
          source_traffic_estimate?: number | null
          source_url?: string
          target_page?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_content_calendar: {
        Row: {
          assigned_to: string | null
          backlinks_earned: number | null
          content_type: string | null
          created_at: string | null
          draft_url: string | null
          evergreen: boolean | null
          id: string
          is_seasonal: boolean | null
          link_building_angle: string | null
          outreach_planned: boolean | null
          page_views: number | null
          planned_date: string | null
          published_at: string | null
          published_url: string | null
          season: string | null
          social_shares: number | null
          status: string | null
          target_keywords: string[] | null
          target_publications: string[] | null
          title: string
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          backlinks_earned?: number | null
          content_type?: string | null
          created_at?: string | null
          draft_url?: string | null
          evergreen?: boolean | null
          id?: string
          is_seasonal?: boolean | null
          link_building_angle?: string | null
          outreach_planned?: boolean | null
          page_views?: number | null
          planned_date?: string | null
          published_at?: string | null
          published_url?: string | null
          season?: string | null
          social_shares?: number | null
          status?: string | null
          target_keywords?: string[] | null
          target_publications?: string[] | null
          title: string
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          backlinks_earned?: number | null
          content_type?: string | null
          created_at?: string | null
          draft_url?: string | null
          evergreen?: boolean | null
          id?: string
          is_seasonal?: boolean | null
          link_building_angle?: string | null
          outreach_planned?: boolean | null
          page_views?: number | null
          planned_date?: string | null
          published_at?: string | null
          published_url?: string | null
          season?: string | null
          social_shares?: number | null
          status?: string | null
          target_keywords?: string[] | null
          target_publications?: string[] | null
          title?: string
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          ai_generated: boolean | null
          ai_generated_at: string | null
          ai_model: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string
          id: string
          keywords: string[] | null
          leads_generated: number | null
          meta_description: string | null
          meta_title: string | null
          page_views: number | null
          published_at: string | null
          published_url: string | null
          reading_time: number | null
          reading_time_minutes: number | null
          secondary_keywords: string[] | null
          slug: string
          status: string | null
          tags: string[] | null
          target_keyword: string | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_generated_at?: string | null
          ai_model?: string | null
          category?: string
          content: string
          created_at?: string | null
          excerpt: string
          id?: string
          keywords?: string[] | null
          leads_generated?: number | null
          meta_description?: string | null
          meta_title?: string | null
          page_views?: number | null
          published_at?: string | null
          published_url?: string | null
          reading_time?: number | null
          reading_time_minutes?: number | null
          secondary_keywords?: string[] | null
          slug: string
          status?: string | null
          tags?: string[] | null
          target_keyword?: string | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_generated_at?: string | null
          ai_model?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string
          id?: string
          keywords?: string[] | null
          leads_generated?: number | null
          meta_description?: string | null
          meta_title?: string | null
          page_views?: number | null
          published_at?: string | null
          published_url?: string | null
          reading_time?: number | null
          reading_time_minutes?: number | null
          secondary_keywords?: string[] | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          target_keyword?: string | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      booking_recovery_log: {
        Row: {
          booked_at: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          notes: string | null
          original_estimate_date: string | null
          recovery_channel: string | null
          recovery_status: string | null
          recovery_type: string | null
          updated_at: string | null
        }
        Insert: {
          booked_at?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          original_estimate_date?: string | null
          recovery_channel?: string | null
          recovery_status?: string | null
          recovery_type?: string | null
          updated_at?: string | null
        }
        Update: {
          booked_at?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          original_estimate_date?: string | null
          recovery_channel?: string | null
          recovery_status?: string | null
          recovery_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_recovery_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_recovery_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_recovery_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_generation_log: {
        Row: {
          approved_at: string | null
          brevo_campaign_id: number | null
          clicks: number | null
          conversions: number | null
          failure_reason: string | null
          generated_at: string | null
          id: string
          opens: number | null
          photos_used: string[] | null
          recipient_count: number | null
          revenue_attributed: number | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
          trigger_data: Json | null
          trigger_event: string
        }
        Insert: {
          approved_at?: string | null
          brevo_campaign_id?: number | null
          clicks?: number | null
          conversions?: number | null
          failure_reason?: string | null
          generated_at?: string | null
          id?: string
          opens?: number | null
          photos_used?: string[] | null
          recipient_count?: number | null
          revenue_attributed?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_data?: Json | null
          trigger_event: string
        }
        Update: {
          approved_at?: string | null
          brevo_campaign_id?: number | null
          clicks?: number | null
          conversions?: number | null
          failure_reason?: string | null
          generated_at?: string | null
          id?: string
          opens?: number | null
          photos_used?: string[] | null
          recipient_count?: number | null
          revenue_attributed?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_data?: Json | null
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_generation_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          auto_approve: boolean | null
          avg_click_rate: number | null
          avg_open_rate: number | null
          created_at: string | null
          html_template: string
          id: string
          is_active: boolean | null
          list_ids: number[] | null
          list_selection_criteria: Json | null
          min_days_between_sends: number | null
          name: string
          performance_score: number | null
          preheader_template: string | null
          priority: number | null
          service_types: string[] | null
          subject_template: string
          total_sends: number | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          auto_approve?: boolean | null
          avg_click_rate?: number | null
          avg_open_rate?: number | null
          created_at?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          list_ids?: number[] | null
          list_selection_criteria?: Json | null
          min_days_between_sends?: number | null
          name: string
          performance_score?: number | null
          preheader_template?: string | null
          priority?: number | null
          service_types?: string[] | null
          subject_template: string
          total_sends?: number | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          auto_approve?: boolean | null
          avg_click_rate?: number | null
          avg_open_rate?: number | null
          created_at?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          list_ids?: number[] | null
          list_selection_criteria?: Json | null
          min_days_between_sends?: number | null
          name?: string
          performance_score?: number | null
          preheader_template?: string | null
          priority?: number | null
          service_types?: string[] | null
          subject_template?: string
          total_sends?: number | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      cashflow_events: {
        Row: {
          account_sequence_id: string | null
          amount_cents: number
          amount_dollars: number | null
          category: string | null
          created_at: string | null
          currency: string | null
          customer_name: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          source: string
          source_id: string | null
        }
        Insert: {
          account_sequence_id?: string | null
          amount_cents: number
          amount_dollars?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          customer_name?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          source: string
          source_id?: string | null
        }
        Update: {
          account_sequence_id?: string | null
          amount_cents?: number
          amount_dollars?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          customer_name?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          source?: string
          source_id?: string | null
        }
        Relationships: []
      }
      citation_audits: {
        Row: {
          address_matches: boolean | null
          audit_date: string | null
          audit_method: string | null
          citation_id: string | null
          created_at: string | null
          found_address: string | null
          found_name: string | null
          found_phone: string | null
          found_website: string | null
          id: string
          issues_found: string[] | null
          name_matches: boolean | null
          overall_consistent: boolean | null
          phone_matches: boolean | null
          screenshot_url: string | null
          website_matches: boolean | null
        }
        Insert: {
          address_matches?: boolean | null
          audit_date?: string | null
          audit_method?: string | null
          citation_id?: string | null
          created_at?: string | null
          found_address?: string | null
          found_name?: string | null
          found_phone?: string | null
          found_website?: string | null
          id?: string
          issues_found?: string[] | null
          name_matches?: boolean | null
          overall_consistent?: boolean | null
          phone_matches?: boolean | null
          screenshot_url?: string | null
          website_matches?: boolean | null
        }
        Update: {
          address_matches?: boolean | null
          audit_date?: string | null
          audit_method?: string | null
          citation_id?: string | null
          created_at?: string | null
          found_address?: string | null
          found_name?: string | null
          found_phone?: string | null
          found_website?: string | null
          id?: string
          issues_found?: string[] | null
          name_matches?: boolean | null
          overall_consistent?: boolean | null
          phone_matches?: boolean | null
          screenshot_url?: string | null
          website_matches?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "citation_audits_citation_id_fkey"
            columns: ["citation_id"]
            isOneToOne: false
            referencedRelation: "local_citations"
            referencedColumns: ["id"]
          },
        ]
      }
      citation_queue: {
        Row: {
          citation_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          queue_position: number | null
          queued_for: string | null
          submission_data: Json | null
          submission_instructions: string | null
        }
        Insert: {
          citation_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          queue_position?: number | null
          queued_for?: string | null
          submission_data?: Json | null
          submission_instructions?: string | null
        }
        Update: {
          citation_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          queue_position?: number | null
          queued_for?: string | null
          submission_data?: Json | null
          submission_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citation_queue_citation_id_fkey"
            columns: ["citation_id"]
            isOneToOne: false
            referencedRelation: "local_citations"
            referencedColumns: ["id"]
          },
        ]
      }
      clean_score_history: {
        Row: {
          calculated_at: string | null
          id: string
          month: string
          neighborhood_id: string | null
          rank: number | null
          score: number | null
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          month: string
          neighborhood_id?: string | null
          rank?: number | null
          score?: number | null
        }
        Update: {
          calculated_at?: string | null
          id?: string
          month?: string
          neighborhood_id?: string | null
          rank?: number | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clean_score_history_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_accounts: {
        Row: {
          account_type: string | null
          annual_contract_value: number | null
          company_name: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          id: string
          jobber_customer_id: string | null
          last_contact_at: string | null
          lead_id: string | null
          monthly_contract_value: number | null
          next_followup_at: string | null
          notes: string | null
          payment_terms: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          service_agreement: string | null
          status: string | null
          total_locations: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          annual_contract_value?: number | null
          company_name: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          id?: string
          jobber_customer_id?: string | null
          last_contact_at?: string | null
          lead_id?: string | null
          monthly_contract_value?: number | null
          next_followup_at?: string | null
          notes?: string | null
          payment_terms?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          service_agreement?: string | null
          status?: string | null
          total_locations?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          annual_contract_value?: number | null
          company_name?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          id?: string
          jobber_customer_id?: string | null
          last_contact_at?: string | null
          lead_id?: string | null
          monthly_contract_value?: number | null
          next_followup_at?: string | null
          notes?: string | null
          payment_terms?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          service_agreement?: string | null
          status?: string | null
          total_locations?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_locations: {
        Row: {
          account_id: string
          address: string | null
          city: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_service_date: string | null
          location_name: string | null
          next_service_date: string | null
          notes: string | null
          per_service_price: number | null
          service_frequency: string | null
          services: string[] | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          account_id: string
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_service_date?: string | null
          location_name?: string | null
          next_service_date?: string | null
          notes?: string | null
          per_service_price?: number | null
          service_frequency?: string | null
          services?: string[] | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          account_id?: string
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_service_date?: string | null
          location_name?: string | null
          next_service_date?: string | null
          notes?: string | null
          per_service_price?: number | null
          service_frequency?: string | null
          services?: string[] | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_locations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "commercial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_backlinks: {
        Row: {
          anchor_text: string | null
          competitor_id: string | null
          created_at: string | null
          discovered_at: string | null
          domain_authority: number | null
          id: string
          is_opportunity: boolean | null
          link_type: string | null
          opportunity_notes: string | null
          opportunity_type: string | null
          our_backlink_id: string | null
          page_authority: number | null
          snapshot_date: string | null
          source_domain: string
          source_url: string
          we_have_link: boolean | null
        }
        Insert: {
          anchor_text?: string | null
          competitor_id?: string | null
          created_at?: string | null
          discovered_at?: string | null
          domain_authority?: number | null
          id?: string
          is_opportunity?: boolean | null
          link_type?: string | null
          opportunity_notes?: string | null
          opportunity_type?: string | null
          our_backlink_id?: string | null
          page_authority?: number | null
          snapshot_date?: string | null
          source_domain: string
          source_url: string
          we_have_link?: boolean | null
        }
        Update: {
          anchor_text?: string | null
          competitor_id?: string | null
          created_at?: string | null
          discovered_at?: string | null
          domain_authority?: number | null
          id?: string
          is_opportunity?: boolean | null
          link_type?: string | null
          opportunity_notes?: string | null
          opportunity_type?: string | null
          our_backlink_id?: string | null
          page_authority?: number | null
          snapshot_date?: string | null
          source_domain?: string
          source_url?: string
          we_have_link?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_backlinks_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_backlinks_our_backlink_id_fkey"
            columns: ["our_backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_snapshots: {
        Row: {
          competitor_name: string
          id: string
          pages: Json | null
          snapshot_at: string | null
        }
        Insert: {
          competitor_name: string
          id?: string
          pages?: Json | null
          snapshot_at?: string | null
        }
        Update: {
          competitor_name?: string
          id?: string
          pages?: Json | null
          snapshot_at?: string | null
        }
        Relationships: []
      }
      competitor_social_posts: {
        Row: {
          competitor_id: string | null
          competitor_name: string
          content_themes: string[] | null
          created_at: string | null
          engagement_comments: number | null
          engagement_likes: number | null
          engagement_shares: number | null
          estimated_reach: number | null
          fetched_at: string | null
          hooks_used: string[] | null
          id: string
          is_viral: boolean | null
          lessons: string | null
          platform: string
          post_text: string | null
          post_type: string | null
          post_url: string | null
          total_engagement: number | null
        }
        Insert: {
          competitor_id?: string | null
          competitor_name: string
          content_themes?: string[] | null
          created_at?: string | null
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          estimated_reach?: number | null
          fetched_at?: string | null
          hooks_used?: string[] | null
          id?: string
          is_viral?: boolean | null
          lessons?: string | null
          platform: string
          post_text?: string | null
          post_type?: string | null
          post_url?: string | null
          total_engagement?: number | null
        }
        Update: {
          competitor_id?: string | null
          competitor_name?: string
          content_themes?: string[] | null
          created_at?: string | null
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          estimated_reach?: number | null
          fetched_at?: string | null
          hooks_used?: string[] | null
          id?: string
          is_viral?: boolean | null
          lessons?: string | null
          platform?: string
          post_text?: string | null
          post_type?: string | null
          post_url?: string | null
          total_engagement?: number | null
        }
        Relationships: []
      }
      competitors: {
        Row: {
          created_at: string | null
          domain: string
          domain_authority: number | null
          id: string
          is_active: boolean | null
          last_analyzed_at: string | null
          location: string | null
          name: string
          notes: string | null
          organic_traffic_estimate: number | null
          priority: number | null
          referring_domains: number | null
          services: string[] | null
          total_backlinks: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          domain_authority?: number | null
          id?: string
          is_active?: boolean | null
          last_analyzed_at?: string | null
          location?: string | null
          name: string
          notes?: string | null
          organic_traffic_estimate?: number | null
          priority?: number | null
          referring_domains?: number | null
          services?: string[] | null
          total_backlinks?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          domain_authority?: number | null
          id?: string
          is_active?: boolean | null
          last_analyzed_at?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          organic_traffic_estimate?: number | null
          priority?: number | null
          referring_domains?: number | null
          services?: string[] | null
          total_backlinks?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      content_ab_results: {
        Row: {
          ab_test_id: string
          clicks: number | null
          conversions: number | null
          created_at: string
          engagement: number | null
          id: string
          impressions: number | null
          measured_at: string
          reach: number | null
          saves: number | null
          shares: number | null
          social_post_id: string | null
          variant: string
        }
        Insert: {
          ab_test_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          engagement?: number | null
          id?: string
          impressions?: number | null
          measured_at?: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          social_post_id?: string | null
          variant: string
        }
        Update: {
          ab_test_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          engagement?: number | null
          id?: string
          impressions?: number | null
          measured_at?: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          social_post_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ab_results_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "content_ab_test_results"
            referencedColumns: ["test_id"]
          },
          {
            foreignKeyName: "content_ab_results_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "content_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ab_tests: {
        Row: {
          confidence_level: number | null
          content_idea_id: string | null
          created_at: string
          end_date: string
          id: string
          platform: string
          start_date: string
          status: string
          test_name: string
          updated_at: string
          variant_a: Json
          variant_b: Json
          winner: string | null
          winning_insights: string | null
        }
        Insert: {
          confidence_level?: number | null
          content_idea_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          platform: string
          start_date?: string
          status?: string
          test_name: string
          updated_at?: string
          variant_a: Json
          variant_b: Json
          winner?: string | null
          winning_insights?: string | null
        }
        Update: {
          confidence_level?: number | null
          content_idea_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          platform?: string
          start_date?: string
          status?: string
          test_name?: string
          updated_at?: string
          variant_a?: Json
          variant_b?: Json
          winner?: string | null
          winning_insights?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_ab_tests_content_idea_id_fkey"
            columns: ["content_idea_id"]
            isOneToOne: false
            referencedRelation: "content_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      content_calendar: {
        Row: {
          blog_post_id: string | null
          category: string | null
          created_at: string | null
          id: string
          notes: string | null
          priority: string | null
          scheduled_date: string
          status: string | null
          target_keyword: string | null
          topic: string
        }
        Insert: {
          blog_post_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          scheduled_date: string
          status?: string | null
          target_keyword?: string | null
          topic: string
        }
        Update: {
          blog_post_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          scheduled_date?: string
          status?: string | null
          target_keyword?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_distribution_queue: {
        Row: {
          channel: string
          created_at: string | null
          distributed_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          media_asset_id: string
          priority: number | null
          retry_count: number | null
          scheduled_for: string | null
          status: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          distributed_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          media_asset_id: string
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          distributed_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          media_asset_id?: string
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_distribution_queue_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_distribution_queue_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_pending_approval"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ideas: {
        Row: {
          ai_model: string | null
          content_type: string | null
          created_at: string | null
          full_caption: string | null
          hashtags: string[] | null
          hook_text: string | null
          id: string
          idea_text: string
          media_asset_id: string | null
          platform: string | null
          platform_captions: Json | null
          posted_to_social_post_id: string | null
          seasonal_relevance: string | null
          service_type: string | null
          source: string
          source_data: Json | null
          source_url: string | null
          status: string | null
          updated_at: string | null
          viral_hook_id: string | null
          virality_score: number | null
        }
        Insert: {
          ai_model?: string | null
          content_type?: string | null
          created_at?: string | null
          full_caption?: string | null
          hashtags?: string[] | null
          hook_text?: string | null
          id?: string
          idea_text: string
          media_asset_id?: string | null
          platform?: string | null
          platform_captions?: Json | null
          posted_to_social_post_id?: string | null
          seasonal_relevance?: string | null
          service_type?: string | null
          source: string
          source_data?: Json | null
          source_url?: string | null
          status?: string | null
          updated_at?: string | null
          viral_hook_id?: string | null
          virality_score?: number | null
        }
        Update: {
          ai_model?: string | null
          content_type?: string | null
          created_at?: string | null
          full_caption?: string | null
          hashtags?: string[] | null
          hook_text?: string | null
          id?: string
          idea_text?: string
          media_asset_id?: string | null
          platform?: string | null
          platform_captions?: Json | null
          posted_to_social_post_id?: string | null
          seasonal_relevance?: string | null
          service_type?: string | null
          source?: string
          source_data?: Json | null
          source_url?: string | null
          status?: string | null
          updated_at?: string | null
          viral_hook_id?: string | null
          virality_score?: number | null
        }
        Relationships: []
      }
      customer_health: {
        Row: {
          avg_job_value: number | null
          churn_risk_pct: number | null
          created_at: string | null
          customer_email: string
          customer_name: string | null
          days_since_last_service: number | null
          email_engagement_score: number | null
          first_service_date: string | null
          health_score: number | null
          health_tier: string | null
          id: string
          jobber_customer_id: string | null
          last_email_click_at: string | null
          last_email_open_at: string | null
          last_scored_at: string | null
          last_service_date: string | null
          missed_seasonal_service: boolean | null
          payment_issues: boolean | null
          phone: string | null
          referrals_made: number | null
          review_left: boolean | null
          rfm_frequency_score: number | null
          rfm_monetary_score: number | null
          rfm_recency_score: number | null
          rfm_total_score: number | null
          services_used: string[] | null
          total_jobs: number | null
          total_revenue: number | null
          updated_at: string | null
          winback_campaign_sent: boolean | null
          winback_converted: boolean | null
          winback_eligible: boolean | null
          winback_sent_at: string | null
        }
        Insert: {
          avg_job_value?: number | null
          churn_risk_pct?: number | null
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          days_since_last_service?: number | null
          email_engagement_score?: number | null
          first_service_date?: string | null
          health_score?: number | null
          health_tier?: string | null
          id?: string
          jobber_customer_id?: string | null
          last_email_click_at?: string | null
          last_email_open_at?: string | null
          last_scored_at?: string | null
          last_service_date?: string | null
          missed_seasonal_service?: boolean | null
          payment_issues?: boolean | null
          phone?: string | null
          referrals_made?: number | null
          review_left?: boolean | null
          rfm_frequency_score?: number | null
          rfm_monetary_score?: number | null
          rfm_recency_score?: number | null
          rfm_total_score?: number | null
          services_used?: string[] | null
          total_jobs?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          winback_campaign_sent?: boolean | null
          winback_converted?: boolean | null
          winback_eligible?: boolean | null
          winback_sent_at?: string | null
        }
        Update: {
          avg_job_value?: number | null
          churn_risk_pct?: number | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          days_since_last_service?: number | null
          email_engagement_score?: number | null
          first_service_date?: string | null
          health_score?: number | null
          health_tier?: string | null
          id?: string
          jobber_customer_id?: string | null
          last_email_click_at?: string | null
          last_email_open_at?: string | null
          last_scored_at?: string | null
          last_service_date?: string | null
          missed_seasonal_service?: boolean | null
          payment_issues?: boolean | null
          phone?: string | null
          referrals_made?: number | null
          review_left?: boolean | null
          rfm_frequency_score?: number | null
          rfm_monetary_score?: number | null
          rfm_recency_score?: number | null
          rfm_total_score?: number | null
          services_used?: string[] | null
          total_jobs?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          winback_campaign_sent?: boolean | null
          winback_converted?: boolean | null
          winback_eligible?: boolean | null
          winback_sent_at?: string | null
        }
        Relationships: []
      }
      customer_subscriptions: {
        Row: {
          cancelled_reason: string | null
          created_at: string | null
          end_date: string | null
          id: string
          lead_id: string | null
          next_service_date: string | null
          notes: string | null
          plan_id: string | null
          renewal_reminder_14d_sent: string | null
          renewal_reminder_30d_sent: string | null
          renewal_reminder_3d_sent: string | null
          start_date: string
          status: string | null
          total_revenue: number | null
          total_services_completed: number | null
          updated_at: string | null
        }
        Insert: {
          cancelled_reason?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          next_service_date?: string | null
          notes?: string | null
          plan_id?: string | null
          renewal_reminder_14d_sent?: string | null
          renewal_reminder_30d_sent?: string | null
          renewal_reminder_3d_sent?: string | null
          start_date: string
          status?: string | null
          total_revenue?: number | null
          total_services_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          cancelled_reason?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          next_service_date?: string | null
          notes?: string | null
          plan_id?: string | null
          renewal_reminder_14d_sent?: string | null
          renewal_reminder_30d_sent?: string | null
          renewal_reminder_3d_sent?: string | null
          start_date?: string
          status?: string | null
          total_revenue?: number | null
          total_services_completed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_log: {
        Row: {
          address: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          dispatch_sms_sent_at: string | null
          event_type: string
          id: string
          jobber_event_id: string | null
          maps_url: string | null
          owner_responded_at: string | null
          owner_response: string | null
          reminder_sent_at: string | null
          scheduled_time: string | null
          service_type: string | null
          status: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          dispatch_sms_sent_at?: string | null
          event_type: string
          id?: string
          jobber_event_id?: string | null
          maps_url?: string | null
          owner_responded_at?: string | null
          owner_response?: string | null
          reminder_sent_at?: string | null
          scheduled_time?: string | null
          service_type?: string | null
          status?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          dispatch_sms_sent_at?: string | null
          event_type?: string
          id?: string
          jobber_event_id?: string | null
          maps_url?: string | null
          owner_responded_at?: string | null
          owner_response?: string | null
          reminder_sent_at?: string | null
          scheduled_time?: string | null
          service_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      door_hanger_batches: {
        Row: {
          area: string | null
          conversion_rate: number | null
          conversions: number | null
          cost: number | null
          created_at: string | null
          deployed_at: string | null
          id: string
          quantity: number | null
          responses: number | null
          revenue_attributed: number | null
          updated_at: string | null
          variant: string | null
          zip_code: string | null
        }
        Insert: {
          area?: string | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          deployed_at?: string | null
          id?: string
          quantity?: number | null
          responses?: number | null
          revenue_attributed?: number | null
          updated_at?: string | null
          variant?: string | null
          zip_code?: string | null
        }
        Update: {
          area?: string | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          deployed_at?: string | null
          id?: string
          quantity?: number | null
          responses?: number | null
          revenue_attributed?: number | null
          updated_at?: string | null
          variant?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      door_hanger_campaigns: {
        Row: {
          campaign_date: string | null
          campaign_name: string
          cost: number | null
          created_at: string | null
          design_version: string | null
          distributed_by: string | null
          hanger_count: number | null
          hangers_distributed: number | null
          id: string
          leads_attributed: number | null
          offer_details: string | null
          offer_type: string | null
          promo_code: string | null
          revenue_attributed: number | null
          status: string | null
          target_area: string | null
          target_neighborhoods: string[] | null
          target_zip_codes: string[] | null
          territory_id: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_date?: string | null
          campaign_name: string
          cost?: number | null
          created_at?: string | null
          design_version?: string | null
          distributed_by?: string | null
          hanger_count?: number | null
          hangers_distributed?: number | null
          id?: string
          leads_attributed?: number | null
          offer_details?: string | null
          offer_type?: string | null
          promo_code?: string | null
          revenue_attributed?: number | null
          status?: string | null
          target_area?: string | null
          target_neighborhoods?: string[] | null
          target_zip_codes?: string[] | null
          territory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_date?: string | null
          campaign_name?: string
          cost?: number | null
          created_at?: string | null
          design_version?: string | null
          distributed_by?: string | null
          hanger_count?: number | null
          hangers_distributed?: number | null
          id?: string
          leads_attributed?: number | null
          offer_details?: string | null
          offer_type?: string | null
          promo_code?: string | null
          revenue_attributed?: number | null
          status?: string | null
          target_area?: string | null
          target_neighborhoods?: string[] | null
          target_zip_codes?: string[] | null
          territory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "door_hanger_campaigns_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sends: {
        Row: {
          ab_test_id: string | null
          ab_variant_id: string | null
          brevo_message_id: string | null
          campaign_id: number | null
          clicked_at: string | null
          contact_email: string
          converted_at: string | null
          created_at: string | null
          email_type: string
          id: string
          opened_at: string | null
          segment_name: string | null
          sent_at: string | null
          sequence_step: number | null
          template_id: number | null
          workflow_name: string
        }
        Insert: {
          ab_test_id?: string | null
          ab_variant_id?: string | null
          brevo_message_id?: string | null
          campaign_id?: number | null
          clicked_at?: string | null
          contact_email: string
          converted_at?: string | null
          created_at?: string | null
          email_type: string
          id?: string
          opened_at?: string | null
          segment_name?: string | null
          sent_at?: string | null
          sequence_step?: number | null
          template_id?: number | null
          workflow_name: string
        }
        Update: {
          ab_test_id?: string | null
          ab_variant_id?: string | null
          brevo_message_id?: string | null
          campaign_id?: number | null
          clicked_at?: string | null
          contact_email?: string
          converted_at?: string | null
          created_at?: string | null
          email_type?: string
          id?: string
          opened_at?: string | null
          segment_name?: string | null
          sent_at?: string | null
          sequence_step?: number | null
          template_id?: number | null
          workflow_name?: string
        }
        Relationships: []
      }
      estimates: {
        Row: {
          approved_at: string | null
          assigned_to: string | null
          converted_to_job_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          declined_at: string | null
          estimate_number: string | null
          expires_at: string | null
          followup_email_day1_sent_at: string | null
          followup_email_day14_sent_at: string | null
          followup_email_day7_sent_at: string | null
          followup_enrolled_at: string | null
          followup_expired_at: string | null
          followup_notes: string | null
          followup_sms_day2_sent_at: string | null
          followup_sms_day3_sent_at: string | null
          followup_status: string | null
          id: string
          jobber_customer_id: string | null
          jobber_estimate_id: string
          jobber_job_id: string | null
          lead_id: string | null
          sent_at: string | null
          service_description: string | null
          service_types: string[] | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          assigned_to?: string | null
          converted_to_job_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          declined_at?: string | null
          estimate_number?: string | null
          expires_at?: string | null
          followup_email_day1_sent_at?: string | null
          followup_email_day14_sent_at?: string | null
          followup_email_day7_sent_at?: string | null
          followup_enrolled_at?: string | null
          followup_expired_at?: string | null
          followup_notes?: string | null
          followup_sms_day2_sent_at?: string | null
          followup_sms_day3_sent_at?: string | null
          followup_status?: string | null
          id?: string
          jobber_customer_id?: string | null
          jobber_estimate_id: string
          jobber_job_id?: string | null
          lead_id?: string | null
          sent_at?: string | null
          service_description?: string | null
          service_types?: string[] | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          assigned_to?: string | null
          converted_to_job_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          declined_at?: string | null
          estimate_number?: string | null
          expires_at?: string | null
          followup_email_day1_sent_at?: string | null
          followup_email_day14_sent_at?: string | null
          followup_email_day7_sent_at?: string | null
          followup_enrolled_at?: string | null
          followup_expired_at?: string | null
          followup_notes?: string | null
          followup_sms_day2_sent_at?: string | null
          followup_sms_day3_sent_at?: string | null
          followup_status?: string | null
          id?: string
          jobber_customer_id?: string | null
          jobber_estimate_id?: string
          jobber_job_id?: string | null
          lead_id?: string | null
          sent_at?: string | null
          service_description?: string | null
          service_types?: string[] | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      fertilizer_schedule: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          lead_id: string | null
          plan_year: number
          reminder_sent_at: string | null
          scheduled_date: string
          service_completed_at: string | null
          step_name: string
          step_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          lead_id?: string | null
          plan_year?: number
          reminder_sent_at?: string | null
          scheduled_date: string
          service_completed_at?: string | null
          step_name: string
          step_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          lead_id?: string | null
          plan_year?: number
          reminder_sent_at?: string | null
          scheduled_date?: string
          service_completed_at?: string | null
          step_name?: string
          step_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fertilizer_schedule_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fertilizer_schedule_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fertilizer_schedule_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      field_marketing_compliance: {
        Row: {
          check_date: string | null
          compliance_score: number | null
          created_at: string | null
          customer_city: string | null
          escalated: boolean | null
          escalated_at: string | null
          id: string
          job_id: string
          missing_reason: string | null
          resolved: boolean | null
          resolved_at: string | null
          service_type: string | null
          sign_deployed: boolean | null
          sign_deployed_at: string | null
          sign_deployment_id: string | null
        }
        Insert: {
          check_date?: string | null
          compliance_score?: number | null
          created_at?: string | null
          customer_city?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          job_id: string
          missing_reason?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_type?: string | null
          sign_deployed?: boolean | null
          sign_deployed_at?: string | null
          sign_deployment_id?: string | null
        }
        Update: {
          check_date?: string | null
          compliance_score?: number | null
          created_at?: string | null
          customer_city?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          job_id?: string
          missing_reason?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_type?: string | null
          sign_deployed?: boolean | null
          sign_deployed_at?: string | null
          sign_deployment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_marketing_compliance_sign_deployment_id_fkey"
            columns: ["sign_deployment_id"]
            isOneToOne: false
            referencedRelation: "yard_sign_deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_daily_snapshots: {
        Row: {
          account_count: number | null
          business_balance: number | null
          created_at: string | null
          id: string
          investment_balance: number | null
          net_cashflow: number | null
          personal_balance: number | null
          snapshot_date: string
          total_balance: number | null
          total_expenses: number | null
          total_income: number | null
        }
        Insert: {
          account_count?: number | null
          business_balance?: number | null
          created_at?: string | null
          id?: string
          investment_balance?: number | null
          net_cashflow?: number | null
          personal_balance?: number | null
          snapshot_date: string
          total_balance?: number | null
          total_expenses?: number | null
          total_income?: number | null
        }
        Update: {
          account_count?: number | null
          business_balance?: number | null
          created_at?: string | null
          id?: string
          investment_balance?: number | null
          net_cashflow?: number | null
          personal_balance?: number | null
          snapshot_date?: string
          total_balance?: number | null
          total_expenses?: number | null
          total_income?: number | null
        }
        Relationships: []
      }
      financial_institutions: {
        Row: {
          created_at: string | null
          id: string
          institution_type: string | null
          logo_url: string | null
          name: string
          provider: string | null
          sequence_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_type?: string | null
          logo_url?: string | null
          name: string
          provider?: string | null
          sequence_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_type?: string | null
          logo_url?: string | null
          name?: string
          provider?: string | null
          sequence_id?: string
        }
        Relationships: []
      }
      ga4_daily_metrics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          new_users: number | null
          page_views: number | null
          sessions: number | null
          total_users: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_users?: number | null
          page_views?: number | null
          sessions?: number | null
          total_users?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_users?: number | null
          page_views?: number | null
          sessions?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      ga4_demographics: {
        Row: {
          conversions: number | null
          created_at: string | null
          dimension_type: string
          dimension_value: string
          id: string
          sessions: number | null
          users: number | null
          week_start: string
        }
        Insert: {
          conversions?: number | null
          created_at?: string | null
          dimension_type: string
          dimension_value: string
          id?: string
          sessions?: number | null
          users?: number | null
          week_start: string
        }
        Update: {
          conversions?: number | null
          created_at?: string | null
          dimension_type?: string
          dimension_value?: string
          id?: string
          sessions?: number | null
          users?: number | null
          week_start?: string
        }
        Relationships: []
      }
      ga4_top_pages: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          page_path: string
          page_title: string | null
          page_views: number | null
          unique_views: number | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          page_path: string
          page_title?: string | null
          page_views?: number | null
          unique_views?: number | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          page_path?: string
          page_title?: string | null
          page_views?: number | null
          unique_views?: number | null
        }
        Relationships: []
      }
      ga4_traffic_sources: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          channel_group: string
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          medium: string | null
          new_users: number | null
          sessions: number | null
          source: string | null
          users: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          channel_group: string
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          medium?: string | null
          new_users?: number | null
          sessions?: number | null
          source?: string | null
          users?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          channel_group?: string
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          medium?: string | null
          new_users?: number | null
          sessions?: number | null
          source?: string | null
          users?: number | null
        }
        Relationships: []
      }
      gbp_content_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          reason: string | null
          rule_type: string
          value: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          reason?: string | null
          rule_type: string
          value: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          reason?: string | null
          rule_type?: string
          value?: string
        }
        Relationships: []
      }
      gbp_optimization_scores: {
        Row: {
          applied_changes: Json | null
          category_scores: Json
          created_at: string
          id: string
          overall_score: number
          recommendations: Json | null
          scored_at: string
        }
        Insert: {
          applied_changes?: Json | null
          category_scores?: Json
          created_at?: string
          id?: string
          overall_score: number
          recommendations?: Json | null
          scored_at?: string
        }
        Update: {
          applied_changes?: Json | null
          category_scores?: Json
          created_at?: string
          id?: string
          overall_score?: number
          recommendations?: Json | null
          scored_at?: string
        }
        Relationships: []
      }
      gbp_posts: {
        Row: {
          content: string
          created_at: string | null
          cta_url: string | null
          google_post_id: string | null
          id: string
          image_path: string | null
          post_type: string
          published_at: string | null
          removal_reason: string | null
          removed_at: string | null
          service_slug: string | null
          status: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          cta_url?: string | null
          google_post_id?: string | null
          id?: string
          image_path?: string | null
          post_type: string
          published_at?: string | null
          removal_reason?: string | null
          removed_at?: string | null
          service_slug?: string | null
          status?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          cta_url?: string | null
          google_post_id?: string | null
          id?: string
          image_path?: string | null
          post_type?: string
          published_at?: string | null
          removal_reason?: string | null
          removed_at?: string | null
          service_slug?: string | null
          status?: string | null
        }
        Relationships: []
      }
      gift_certificate_transactions: {
        Row: {
          amount: number
          certificate_id: string
          created_at: string | null
          description: string | null
          id: string
          job_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          certificate_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          certificate_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_certificate_transactions_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "gift_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_certificates: {
        Row: {
          amount: number
          code: string
          created_at: string | null
          delivered_at: string | null
          delivery_method: string | null
          expires_at: string | null
          first_used_at: string | null
          fully_used_at: string | null
          id: string
          lead_id: string | null
          personal_message: string | null
          purchased_at: string | null
          purchaser_email: string | null
          purchaser_name: string | null
          purchaser_phone: string | null
          recipient_email: string | null
          recipient_name: string | null
          remaining_balance: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          expires_at?: string | null
          first_used_at?: string | null
          fully_used_at?: string | null
          id?: string
          lead_id?: string | null
          personal_message?: string | null
          purchased_at?: string | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          purchaser_phone?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          remaining_balance: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          expires_at?: string | null
          first_used_at?: string | null
          fully_used_at?: string | null
          id?: string
          lead_id?: string | null
          personal_message?: string | null
          purchased_at?: string | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          purchaser_phone?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          remaining_balance?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_certificates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_certificates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_certificates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_alerts: {
        Row: {
          action_taken: string | null
          alert_data: Json | null
          alert_type: string
          campaign_id: string | null
          campaign_name: string | null
          created_at: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
        }
        Insert: {
          action_taken?: string | null
          alert_data?: Json | null
          alert_type: string
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
        }
        Update: {
          action_taken?: string | null
          alert_data?: Json | null
          alert_type?: string
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
        }
        Relationships: []
      }
      google_ads_daily: {
        Row: {
          ad_group_id: string | null
          ad_group_name: string | null
          avg_cpc: number | null
          campaign_id: string | null
          campaign_name: string | null
          clicks: number | null
          conversion_value: number | null
          conversions: number | null
          cost: number | null
          cost_micros: number | null
          created_at: string | null
          ctr: number | null
          id: string
          impressions: number | null
          metric_date: string
          roas: number | null
          search_impression_share: number | null
        }
        Insert: {
          ad_group_id?: string | null
          ad_group_name?: string | null
          avg_cpc?: number | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost?: number | null
          cost_micros?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date: string
          roas?: number | null
          search_impression_share?: number | null
        }
        Update: {
          ad_group_id?: string | null
          ad_group_name?: string | null
          avg_cpc?: number | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost?: number | null
          cost_micros?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          metric_date?: string
          roas?: number | null
          search_impression_share?: number | null
        }
        Relationships: []
      }
      gsc_pages: {
        Row: {
          avg_position: number | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          page: string
        }
        Insert: {
          avg_position?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          page: string
        }
        Update: {
          avg_position?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          page?: string
        }
        Relationships: []
      }
      gsc_search_queries: {
        Row: {
          clicks: number | null
          country: string | null
          created_at: string | null
          ctr: number | null
          date: string
          device: string | null
          id: string
          impressions: number | null
          page: string | null
          position: number | null
          query: string
        }
        Insert: {
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          ctr?: number | null
          date: string
          device?: string | null
          id?: string
          impressions?: number | null
          page?: string | null
          position?: number | null
          query: string
        }
        Update: {
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          device?: string | null
          id?: string
          impressions?: number | null
          page?: string | null
          position?: number | null
          query?: string
        }
        Relationships: []
      }
      guest_post_opportunities: {
        Row: {
          accepted_topics: string[] | null
          allows_contextual_links: boolean | null
          article_draft_url: string | null
          article_published_at: string | null
          article_submitted_at: string | null
          article_title: string | null
          article_topic: string | null
          backlink_anchor_text: string | null
          backlink_obtained: boolean | null
          backlink_policy: string | null
          backlink_url: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          discovered_at: string | null
          discovery_method: string | null
          domain_authority: number | null
          follow_up_count: number | null
          guidelines_summary: string | null
          id: string
          includes_author_bio: boolean | null
          last_follow_up_at: string | null
          monthly_traffic_estimate: string | null
          notes: string | null
          outreach_status: string | null
          pitch_email_text: string | null
          pitch_sent_at: string | null
          priority: number | null
          published_url: string | null
          relevance_category: string | null
          response_received_at: string | null
          response_type: string | null
          revision_notes: string | null
          revision_requested: boolean | null
          site_name: string
          site_url: string
          updated_at: string | null
          word_count_max: number | null
          word_count_min: number | null
          write_for_us_url: string | null
        }
        Insert: {
          accepted_topics?: string[] | null
          allows_contextual_links?: boolean | null
          article_draft_url?: string | null
          article_published_at?: string | null
          article_submitted_at?: string | null
          article_title?: string | null
          article_topic?: string | null
          backlink_anchor_text?: string | null
          backlink_obtained?: boolean | null
          backlink_policy?: string | null
          backlink_url?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          discovered_at?: string | null
          discovery_method?: string | null
          domain_authority?: number | null
          follow_up_count?: number | null
          guidelines_summary?: string | null
          id?: string
          includes_author_bio?: boolean | null
          last_follow_up_at?: string | null
          monthly_traffic_estimate?: string | null
          notes?: string | null
          outreach_status?: string | null
          pitch_email_text?: string | null
          pitch_sent_at?: string | null
          priority?: number | null
          published_url?: string | null
          relevance_category?: string | null
          response_received_at?: string | null
          response_type?: string | null
          revision_notes?: string | null
          revision_requested?: boolean | null
          site_name: string
          site_url: string
          updated_at?: string | null
          word_count_max?: number | null
          word_count_min?: number | null
          write_for_us_url?: string | null
        }
        Update: {
          accepted_topics?: string[] | null
          allows_contextual_links?: boolean | null
          article_draft_url?: string | null
          article_published_at?: string | null
          article_submitted_at?: string | null
          article_title?: string | null
          article_topic?: string | null
          backlink_anchor_text?: string | null
          backlink_obtained?: boolean | null
          backlink_policy?: string | null
          backlink_url?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          discovered_at?: string | null
          discovery_method?: string | null
          domain_authority?: number | null
          follow_up_count?: number | null
          guidelines_summary?: string | null
          id?: string
          includes_author_bio?: boolean | null
          last_follow_up_at?: string | null
          monthly_traffic_estimate?: string | null
          notes?: string | null
          outreach_status?: string | null
          pitch_email_text?: string | null
          pitch_sent_at?: string | null
          priority?: number | null
          published_url?: string | null
          relevance_category?: string | null
          response_received_at?: string | null
          response_type?: string | null
          revision_notes?: string | null
          revision_requested?: boolean | null
          site_name?: string
          site_url?: string
          updated_at?: string | null
          word_count_max?: number | null
          word_count_min?: number | null
          write_for_us_url?: string | null
        }
        Relationships: []
      }
      index_coverage_log: {
        Row: {
          alert_sent: boolean | null
          check_date: string
          coverage_state: string | null
          created_at: string | null
          google_canonical: string | null
          id: string
          indexing_state: string | null
          last_crawl_time: string | null
          page_fetch_state: string | null
          page_url: string
          previous_verdict: string | null
          robots_txt_state: string | null
          verdict: string | null
        }
        Insert: {
          alert_sent?: boolean | null
          check_date: string
          coverage_state?: string | null
          created_at?: string | null
          google_canonical?: string | null
          id?: string
          indexing_state?: string | null
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          page_url: string
          previous_verdict?: string | null
          robots_txt_state?: string | null
          verdict?: string | null
        }
        Update: {
          alert_sent?: boolean | null
          check_date?: string
          coverage_state?: string | null
          created_at?: string | null
          google_canonical?: string | null
          id?: string
          indexing_state?: string | null
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          page_url?: string
          previous_verdict?: string | null
          robots_txt_state?: string | null
          verdict?: string | null
        }
        Relationships: []
      }
      institutional_contacts: {
        Row: {
          apollo_id: string | null
          contact_role: string | null
          created_at: string | null
          current_sequence_step: number | null
          department: string | null
          do_not_contact: boolean | null
          email: string | null
          enriched_at: string | null
          enrichment_source: string | null
          first_name: string | null
          id: string
          is_decision_maker: boolean | null
          is_primary_contact: boolean | null
          last_contacted_at: string | null
          last_name: string | null
          last_reply_at: string | null
          linkedin_url: string | null
          notes: string | null
          org_id: string
          outreach_status: string | null
          phone: string | null
          reply_sentiment: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          apollo_id?: string | null
          contact_role?: string | null
          created_at?: string | null
          current_sequence_step?: number | null
          department?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          enriched_at?: string | null
          enrichment_source?: string | null
          first_name?: string | null
          id?: string
          is_decision_maker?: boolean | null
          is_primary_contact?: boolean | null
          last_contacted_at?: string | null
          last_name?: string | null
          last_reply_at?: string | null
          linkedin_url?: string | null
          notes?: string | null
          org_id: string
          outreach_status?: string | null
          phone?: string | null
          reply_sentiment?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          apollo_id?: string | null
          contact_role?: string | null
          created_at?: string | null
          current_sequence_step?: number | null
          department?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          enriched_at?: string | null
          enrichment_source?: string | null
          first_name?: string | null
          id?: string
          is_decision_maker?: boolean | null
          is_primary_contact?: boolean | null
          last_contacted_at?: string | null
          last_name?: string | null
          last_reply_at?: string | null
          linkedin_url?: string | null
          notes?: string | null
          org_id?: string
          outreach_status?: string | null
          phone?: string | null
          reply_sentiment?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_followup_queue"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "institutional_contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "vendor_list_renewal_alerts"
            referencedColumns: ["org_id"]
          },
        ]
      }
      institutional_orgs: {
        Row: {
          application_approved_at: string | null
          application_expiry_date: string | null
          application_notes: string | null
          application_renewal_date: string | null
          application_status: string | null
          application_submitted_at: string | null
          brevo_contact_id: string | null
          city: string | null
          commercial_account_id: string | null
          created_at: string | null
          discovered_at: string | null
          estimated_annual_value: number | null
          first_contacted_at: string | null
          has_vendor_list: boolean | null
          id: string
          last_contacted_at: string | null
          last_reply_at: string | null
          main_email: string | null
          main_phone: string | null
          next_followup_at: string | null
          notes: string | null
          org_name: string
          org_type: string
          physical_address: string | null
          pipeline_stage: string | null
          priority: string | null
          procurement_contact_email: string | null
          procurement_contact_name: string | null
          procurement_contact_phone: string | null
          procurement_portal_url: string | null
          relationship_score: number | null
          rfp_monitoring_active: boolean | null
          sector: string
          services_needed: string[] | null
          source: string | null
          state: string | null
          tags: string[] | null
          total_contacts_sent: number | null
          total_locations_to_serve: number | null
          total_replies_received: number | null
          updated_at: string | null
          vendor_list_name: string | null
          vendor_list_requirements: string[] | null
          vendor_list_url: string | null
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          application_approved_at?: string | null
          application_expiry_date?: string | null
          application_notes?: string | null
          application_renewal_date?: string | null
          application_status?: string | null
          application_submitted_at?: string | null
          brevo_contact_id?: string | null
          city?: string | null
          commercial_account_id?: string | null
          created_at?: string | null
          discovered_at?: string | null
          estimated_annual_value?: number | null
          first_contacted_at?: string | null
          has_vendor_list?: boolean | null
          id?: string
          last_contacted_at?: string | null
          last_reply_at?: string | null
          main_email?: string | null
          main_phone?: string | null
          next_followup_at?: string | null
          notes?: string | null
          org_name: string
          org_type: string
          physical_address?: string | null
          pipeline_stage?: string | null
          priority?: string | null
          procurement_contact_email?: string | null
          procurement_contact_name?: string | null
          procurement_contact_phone?: string | null
          procurement_portal_url?: string | null
          relationship_score?: number | null
          rfp_monitoring_active?: boolean | null
          sector: string
          services_needed?: string[] | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          total_contacts_sent?: number | null
          total_locations_to_serve?: number | null
          total_replies_received?: number | null
          updated_at?: string | null
          vendor_list_name?: string | null
          vendor_list_requirements?: string[] | null
          vendor_list_url?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          application_approved_at?: string | null
          application_expiry_date?: string | null
          application_notes?: string | null
          application_renewal_date?: string | null
          application_status?: string | null
          application_submitted_at?: string | null
          brevo_contact_id?: string | null
          city?: string | null
          commercial_account_id?: string | null
          created_at?: string | null
          discovered_at?: string | null
          estimated_annual_value?: number | null
          first_contacted_at?: string | null
          has_vendor_list?: boolean | null
          id?: string
          last_contacted_at?: string | null
          last_reply_at?: string | null
          main_email?: string | null
          main_phone?: string | null
          next_followup_at?: string | null
          notes?: string | null
          org_name?: string
          org_type?: string
          physical_address?: string | null
          pipeline_stage?: string | null
          priority?: string | null
          procurement_contact_email?: string | null
          procurement_contact_name?: string | null
          procurement_contact_phone?: string | null
          procurement_portal_url?: string | null
          relationship_score?: number | null
          rfp_monitoring_active?: boolean | null
          sector?: string
          services_needed?: string[] | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          total_contacts_sent?: number | null
          total_locations_to_serve?: number | null
          total_replies_received?: number | null
          updated_at?: string | null
          vendor_list_name?: string | null
          vendor_list_requirements?: string[] | null
          vendor_list_url?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      institutional_outreach_log: {
        Row: {
          application_triggered: boolean | null
          bounced: boolean | null
          channel: string
          contact_id: string | null
          created_at: string | null
          id: string
          meeting_date: string | null
          meeting_scheduled: boolean | null
          message_preview: string | null
          opened_at: string | null
          org_id: string
          replied_at: string | null
          reply_sentiment: string | null
          reply_text: string | null
          rfp_triggered: boolean | null
          sent_at: string | null
          sequence_step: number | null
          subject: string | null
          template_name: string | null
        }
        Insert: {
          application_triggered?: boolean | null
          bounced?: boolean | null
          channel: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          meeting_date?: string | null
          meeting_scheduled?: boolean | null
          message_preview?: string | null
          opened_at?: string | null
          org_id: string
          replied_at?: string | null
          reply_sentiment?: string | null
          reply_text?: string | null
          rfp_triggered?: boolean | null
          sent_at?: string | null
          sequence_step?: number | null
          subject?: string | null
          template_name?: string | null
        }
        Update: {
          application_triggered?: boolean | null
          bounced?: boolean | null
          channel?: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          meeting_date?: string | null
          meeting_scheduled?: boolean | null
          message_preview?: string | null
          opened_at?: string | null
          org_id?: string
          replied_at?: string | null
          reply_sentiment?: string | null
          reply_text?: string | null
          rfp_triggered?: boolean | null
          sent_at?: string | null
          sequence_step?: number | null
          subject?: string | null
          template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_outreach_log_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "institutional_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_outreach_log_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "institutional_followup_queue"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "institutional_outreach_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_followup_queue"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "institutional_outreach_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_outreach_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "vendor_list_renewal_alerts"
            referencedColumns: ["org_id"]
          },
        ]
      }
      intelligence_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_date: string
          metric_name: string
          metric_value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_date: string
          metric_name: string
          metric_value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number | null
        }
        Relationships: []
      }
      intelligence_reports: {
        Row: {
          anomalies: Json | null
          created_at: string | null
          highlights: Json | null
          id: string
          report_data: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          sent_at: string | null
        }
        Insert: {
          anomalies?: Json | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          report_data?: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          sent_at?: string | null
        }
        Update: {
          anomalies?: Json | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          report_data?: Json | null
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          attributed: boolean | null
          attributed_at: string | null
          balance_due: number
          collections_email_day10_sent_at: string | null
          collections_email_day14_sent_at: string | null
          collections_email_day3_sent_at: string | null
          collections_enrolled_at: string | null
          collections_escalated_at: string | null
          collections_notes: string | null
          collections_resolved_at: string | null
          collections_sms_day17_sent_at: string | null
          collections_sms_day3_sent_at: string | null
          collections_sms_day7_sent_at: string | null
          collections_status: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          job_description: string | null
          jobber_customer_id: string | null
          jobber_invoice_id: string
          jobber_job_id: string | null
          lead_id: string | null
          lead_source: string | null
          paid_at: string | null
          sent_at: string | null
          service_type: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          attributed?: boolean | null
          attributed_at?: string | null
          balance_due?: number
          collections_email_day10_sent_at?: string | null
          collections_email_day14_sent_at?: string | null
          collections_email_day3_sent_at?: string | null
          collections_enrolled_at?: string | null
          collections_escalated_at?: string | null
          collections_notes?: string | null
          collections_resolved_at?: string | null
          collections_sms_day17_sent_at?: string | null
          collections_sms_day3_sent_at?: string | null
          collections_sms_day7_sent_at?: string | null
          collections_status?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          job_description?: string | null
          jobber_customer_id?: string | null
          jobber_invoice_id: string
          jobber_job_id?: string | null
          lead_id?: string | null
          lead_source?: string | null
          paid_at?: string | null
          sent_at?: string | null
          service_type?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          attributed?: boolean | null
          attributed_at?: string | null
          balance_due?: number
          collections_email_day10_sent_at?: string | null
          collections_email_day14_sent_at?: string | null
          collections_email_day3_sent_at?: string | null
          collections_enrolled_at?: string | null
          collections_escalated_at?: string | null
          collections_notes?: string | null
          collections_resolved_at?: string | null
          collections_sms_day17_sent_at?: string | null
          collections_sms_day3_sent_at?: string | null
          collections_sms_day7_sent_at?: string | null
          collections_status?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          job_description?: string | null
          jobber_customer_id?: string | null
          jobber_invoice_id?: string
          jobber_job_id?: string | null
          lead_id?: string | null
          lead_source?: string | null
          paid_at?: string | null
          sent_at?: string | null
          service_type?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      jobber_email_events: {
        Row: {
          created_at: string | null
          id: string
          parsed_address: string | null
          parsed_amount: number | null
          parsed_at: string | null
          parsed_customer_email: string | null
          parsed_customer_name: string | null
          parsed_customer_phone: string | null
          parsed_event_type: string | null
          parsed_job_status: string | null
          parsed_service: string | null
          processing_status: string | null
          raw_email_body: string | null
          raw_email_subject: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parsed_address?: string | null
          parsed_amount?: number | null
          parsed_at?: string | null
          parsed_customer_email?: string | null
          parsed_customer_name?: string | null
          parsed_customer_phone?: string | null
          parsed_event_type?: string | null
          parsed_job_status?: string | null
          parsed_service?: string | null
          processing_status?: string | null
          raw_email_body?: string | null
          raw_email_subject?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parsed_address?: string | null
          parsed_amount?: number | null
          parsed_at?: string | null
          parsed_customer_email?: string | null
          parsed_customer_name?: string | null
          parsed_customer_phone?: string | null
          parsed_event_type?: string | null
          parsed_job_status?: string | null
          parsed_service?: string | null
          processing_status?: string | null
          raw_email_body?: string | null
          raw_email_subject?: string | null
        }
        Relationships: []
      }
      jobber_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      jobber_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          scopes: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          scopes?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          scopes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      keyword_rankings: {
        Row: {
          created_at: string | null
          date: string
          device: string | null
          featured_snippet: boolean | null
          id: string
          keyword: string
          local_pack: boolean | null
          page_url: string | null
          previous_position: number | null
          rank_position: number | null
          search_engine: string | null
          search_location: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          device?: string | null
          featured_snippet?: boolean | null
          id?: string
          keyword: string
          local_pack?: boolean | null
          page_url?: string | null
          previous_position?: number | null
          rank_position?: number | null
          search_engine?: string | null
          search_location?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          device?: string | null
          featured_snippet?: boolean | null
          id?: string
          keyword?: string
          local_pack?: boolean | null
          page_url?: string | null
          previous_position?: number | null
          rank_position?: number | null
          search_engine?: string | null
          search_location?: string | null
        }
        Relationships: []
      }
      lead_timeline: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          lead_id: string
          performed_by: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          lead_id: string
          performed_by?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          lead_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_timeline_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_timeline_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_timeline_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          attributed_campaign_id: number | null
          attributed_email_id: string | null
          auto_response_email_message_id: string | null
          auto_response_email_sent: boolean | null
          auto_response_sent_at: string | null
          auto_response_sms_sent: boolean | null
          booking_detected_at: string | null
          booking_jobber_job_id: string | null
          brevo_contact_id: string | null
          city: string | null
          created_at: string | null
          email: string | null
          email_engagement_score: number | null
          email_open_history: Json | null
          external_id: string | null
          facebook_lead_id: string | null
          first_job_at: string | null
          first_job_revenue: number | null
          first_name: string | null
          followup_email_day1_sent_at: string | null
          followup_email_day7_sent_at: string | null
          followup_sequence_status: string | null
          followup_sms_day3_sent_at: string | null
          id: string
          job_booked_at: string | null
          job_jobber_id: string | null
          jobber_customer_id: string | null
          jobber_sync_failures: number | null
          jobber_sync_notes: string | null
          jobber_sync_status: string | null
          jobber_synced_at: string | null
          landing_page: string | null
          last_engagement_at: string | null
          last_name: string | null
          latest_job_at: string | null
          latest_job_revenue: number | null
          lead_score: number | null
          lead_tier: string | null
          message: string | null
          nurture_status: string | null
          phone: string | null
          phone_call_duration: number | null
          phone_call_recording_url: string | null
          preferred_send_day: number | null
          preferred_send_hour: number | null
          property_type: string | null
          quote_email_1_sent_at: string | null
          quote_email_2_sent_at: string | null
          quote_email_3_sent_at: string | null
          quote_email_4_sent_at: string | null
          quote_email_5_sent_at: string | null
          quote_followup_enrolled_at: string | null
          quote_followup_status: string | null
          quote_metadata: Json | null
          raw_payload: Json | null
          send_time_calculated_at: string | null
          services: string[] | null
          source: string
          source_detail: string | null
          state: string | null
          status: string | null
          total_revenue: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          attributed_campaign_id?: number | null
          attributed_email_id?: string | null
          auto_response_email_message_id?: string | null
          auto_response_email_sent?: boolean | null
          auto_response_sent_at?: string | null
          auto_response_sms_sent?: boolean | null
          booking_detected_at?: string | null
          booking_jobber_job_id?: string | null
          brevo_contact_id?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          email_engagement_score?: number | null
          email_open_history?: Json | null
          external_id?: string | null
          facebook_lead_id?: string | null
          first_job_at?: string | null
          first_job_revenue?: number | null
          first_name?: string | null
          followup_email_day1_sent_at?: string | null
          followup_email_day7_sent_at?: string | null
          followup_sequence_status?: string | null
          followup_sms_day3_sent_at?: string | null
          id?: string
          job_booked_at?: string | null
          job_jobber_id?: string | null
          jobber_customer_id?: string | null
          jobber_sync_failures?: number | null
          jobber_sync_notes?: string | null
          jobber_sync_status?: string | null
          jobber_synced_at?: string | null
          landing_page?: string | null
          last_engagement_at?: string | null
          last_name?: string | null
          latest_job_at?: string | null
          latest_job_revenue?: number | null
          lead_score?: number | null
          lead_tier?: string | null
          message?: string | null
          nurture_status?: string | null
          phone?: string | null
          phone_call_duration?: number | null
          phone_call_recording_url?: string | null
          preferred_send_day?: number | null
          preferred_send_hour?: number | null
          property_type?: string | null
          quote_email_1_sent_at?: string | null
          quote_email_2_sent_at?: string | null
          quote_email_3_sent_at?: string | null
          quote_email_4_sent_at?: string | null
          quote_email_5_sent_at?: string | null
          quote_followup_enrolled_at?: string | null
          quote_followup_status?: string | null
          quote_metadata?: Json | null
          raw_payload?: Json | null
          send_time_calculated_at?: string | null
          services?: string[] | null
          source?: string
          source_detail?: string | null
          state?: string | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          attributed_campaign_id?: number | null
          attributed_email_id?: string | null
          auto_response_email_message_id?: string | null
          auto_response_email_sent?: boolean | null
          auto_response_sent_at?: string | null
          auto_response_sms_sent?: boolean | null
          booking_detected_at?: string | null
          booking_jobber_job_id?: string | null
          brevo_contact_id?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          email_engagement_score?: number | null
          email_open_history?: Json | null
          external_id?: string | null
          facebook_lead_id?: string | null
          first_job_at?: string | null
          first_job_revenue?: number | null
          first_name?: string | null
          followup_email_day1_sent_at?: string | null
          followup_email_day7_sent_at?: string | null
          followup_sequence_status?: string | null
          followup_sms_day3_sent_at?: string | null
          id?: string
          job_booked_at?: string | null
          job_jobber_id?: string | null
          jobber_customer_id?: string | null
          jobber_sync_failures?: number | null
          jobber_sync_notes?: string | null
          jobber_sync_status?: string | null
          jobber_synced_at?: string | null
          landing_page?: string | null
          last_engagement_at?: string | null
          last_name?: string | null
          latest_job_at?: string | null
          latest_job_revenue?: number | null
          lead_score?: number | null
          lead_tier?: string | null
          message?: string | null
          nurture_status?: string | null
          phone?: string | null
          phone_call_duration?: number | null
          phone_call_recording_url?: string | null
          preferred_send_day?: number | null
          preferred_send_hour?: number | null
          property_type?: string | null
          quote_email_1_sent_at?: string | null
          quote_email_2_sent_at?: string | null
          quote_email_3_sent_at?: string | null
          quote_email_4_sent_at?: string | null
          quote_email_5_sent_at?: string | null
          quote_followup_enrolled_at?: string | null
          quote_followup_status?: string | null
          quote_metadata?: Json | null
          raw_payload?: Json | null
          send_time_calculated_at?: string | null
          services?: string[] | null
          source?: string
          source_detail?: string | null
          state?: string | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      linkable_assets: {
        Row: {
          asset_type: string
          avg_time_on_page: number | null
          backlinks_earned: number | null
          bounce_rate: number | null
          content_url: string | null
          created_at: string | null
          created_by: string | null
          creation_cost: number | null
          description: string | null
          embed_code: string | null
          gate_type: string | null
          id: string
          is_gated: boolean | null
          last_backlink_at: string | null
          leads_generated: number | null
          notes: string | null
          page_views: number | null
          pdf_url: string | null
          preview_image_url: string | null
          promotion_cost: number | null
          published_at: string | null
          referring_domains: number | null
          slug: string
          status: string | null
          target_audience: string | null
          target_keywords: string[] | null
          thumbnail_url: string | null
          title: string
          unique_visitors: number | null
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          avg_time_on_page?: number | null
          backlinks_earned?: number | null
          bounce_rate?: number | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          creation_cost?: number | null
          description?: string | null
          embed_code?: string | null
          gate_type?: string | null
          id?: string
          is_gated?: boolean | null
          last_backlink_at?: string | null
          leads_generated?: number | null
          notes?: string | null
          page_views?: number | null
          pdf_url?: string | null
          preview_image_url?: string | null
          promotion_cost?: number | null
          published_at?: string | null
          referring_domains?: number | null
          slug: string
          status?: string | null
          target_audience?: string | null
          target_keywords?: string[] | null
          thumbnail_url?: string | null
          title: string
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          avg_time_on_page?: number | null
          backlinks_earned?: number | null
          bounce_rate?: number | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          creation_cost?: number | null
          description?: string | null
          embed_code?: string | null
          gate_type?: string | null
          id?: string
          is_gated?: boolean | null
          last_backlink_at?: string | null
          leads_generated?: number | null
          notes?: string | null
          page_views?: number | null
          pdf_url?: string | null
          preview_image_url?: string | null
          promotion_cost?: number | null
          published_at?: string | null
          referring_domains?: number | null
          slug?: string
          status?: string | null
          target_audience?: string | null
          target_keywords?: string[] | null
          thumbnail_url?: string | null
          title?: string
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      linkedin_prospects: {
        Row: {
          became_customer: boolean | null
          became_partner: boolean | null
          company: string | null
          company_size: string | null
          connected_at: string | null
          connection_request_sent_at: string | null
          created_at: string | null
          email: string | null
          first_message_sent_at: string | null
          first_message_text: string | null
          follow_up_1_sent_at: string | null
          follow_up_2_sent_at: string | null
          full_name: string
          id: string
          industry: string | null
          jobber_customer_id: string | null
          linkedin_profile_url: string | null
          location: string | null
          meeting_booked: boolean | null
          meeting_date: string | null
          notes: string | null
          outreach_status: string | null
          phone: string | null
          priority: number | null
          prospect_type: string | null
          relevance_notes: string | null
          relevance_score: number | null
          responded_at: string | null
          response_sentiment: string | null
          response_text: string | null
          revenue_attributed: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          became_customer?: boolean | null
          became_partner?: boolean | null
          company?: string | null
          company_size?: string | null
          connected_at?: string | null
          connection_request_sent_at?: string | null
          created_at?: string | null
          email?: string | null
          first_message_sent_at?: string | null
          first_message_text?: string | null
          follow_up_1_sent_at?: string | null
          follow_up_2_sent_at?: string | null
          full_name: string
          id?: string
          industry?: string | null
          jobber_customer_id?: string | null
          linkedin_profile_url?: string | null
          location?: string | null
          meeting_booked?: boolean | null
          meeting_date?: string | null
          notes?: string | null
          outreach_status?: string | null
          phone?: string | null
          priority?: number | null
          prospect_type?: string | null
          relevance_notes?: string | null
          relevance_score?: number | null
          responded_at?: string | null
          response_sentiment?: string | null
          response_text?: string | null
          revenue_attributed?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          became_customer?: boolean | null
          became_partner?: boolean | null
          company?: string | null
          company_size?: string | null
          connected_at?: string | null
          connection_request_sent_at?: string | null
          created_at?: string | null
          email?: string | null
          first_message_sent_at?: string | null
          first_message_text?: string | null
          follow_up_1_sent_at?: string | null
          follow_up_2_sent_at?: string | null
          full_name?: string
          id?: string
          industry?: string | null
          jobber_customer_id?: string | null
          linkedin_profile_url?: string | null
          location?: string | null
          meeting_booked?: boolean | null
          meeting_date?: string | null
          notes?: string | null
          outreach_status?: string | null
          phone?: string | null
          priority?: number | null
          prospect_type?: string | null
          relevance_notes?: string | null
          relevance_score?: number | null
          responded_at?: string | null
          response_sentiment?: string | null
          response_text?: string | null
          revenue_attributed?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      local_citations: {
        Row: {
          account_email: string | null
          audit_issues: string[] | null
          backlink_type: string | null
          backlink_url: string | null
          created_at: string | null
          directory_name: string
          directory_url: string
          domain_authority: number | null
          has_backlink: boolean | null
          id: string
          is_live: boolean | null
          last_audit_at: string | null
          login_notes: string | null
          nap_consistent: boolean | null
          priority_tier: number | null
          submission_status: string | null
          submission_url: string | null
          submitted_address: string | null
          submitted_at: string | null
          submitted_city: string | null
          submitted_name: string | null
          submitted_phone: string | null
          submitted_state: string | null
          submitted_website: string | null
          submitted_zip: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          account_email?: string | null
          audit_issues?: string[] | null
          backlink_type?: string | null
          backlink_url?: string | null
          created_at?: string | null
          directory_name: string
          directory_url: string
          domain_authority?: number | null
          has_backlink?: boolean | null
          id?: string
          is_live?: boolean | null
          last_audit_at?: string | null
          login_notes?: string | null
          nap_consistent?: boolean | null
          priority_tier?: number | null
          submission_status?: string | null
          submission_url?: string | null
          submitted_address?: string | null
          submitted_at?: string | null
          submitted_city?: string | null
          submitted_name?: string | null
          submitted_phone?: string | null
          submitted_state?: string | null
          submitted_website?: string | null
          submitted_zip?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          account_email?: string | null
          audit_issues?: string[] | null
          backlink_type?: string | null
          backlink_url?: string | null
          created_at?: string | null
          directory_name?: string
          directory_url?: string
          domain_authority?: number | null
          has_backlink?: boolean | null
          id?: string
          is_live?: boolean | null
          last_audit_at?: string | null
          login_notes?: string | null
          nap_consistent?: boolean | null
          priority_tier?: number | null
          submission_status?: string | null
          submission_url?: string | null
          submitted_address?: string | null
          submitted_at?: string | null
          submitted_city?: string | null
          submitted_name?: string | null
          submitted_phone?: string | null
          submitted_state?: string | null
          submitted_website?: string | null
          submitted_zip?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      local_news_mentions: {
        Row: {
          action_result: string | null
          action_status: string | null
          action_taken: string | null
          article_summary: string | null
          article_title: string | null
          article_url: string
          backlink_obtained: boolean | null
          coverage_url: string | null
          created_at: string | null
          discovered_at: string | null
          id: string
          opportunity_type: string | null
          published_at: string | null
          relevant_keywords: string[] | null
          resulted_in_coverage: boolean | null
          source_name: string
          source_url: string | null
        }
        Insert: {
          action_result?: string | null
          action_status?: string | null
          action_taken?: string | null
          article_summary?: string | null
          article_title?: string | null
          article_url: string
          backlink_obtained?: boolean | null
          coverage_url?: string | null
          created_at?: string | null
          discovered_at?: string | null
          id?: string
          opportunity_type?: string | null
          published_at?: string | null
          relevant_keywords?: string[] | null
          resulted_in_coverage?: boolean | null
          source_name: string
          source_url?: string | null
        }
        Update: {
          action_result?: string | null
          action_status?: string | null
          action_taken?: string | null
          article_summary?: string | null
          article_title?: string | null
          article_url?: string
          backlink_obtained?: boolean | null
          coverage_url?: string | null
          created_at?: string | null
          discovered_at?: string | null
          id?: string
          opportunity_type?: string | null
          published_at?: string | null
          relevant_keywords?: string[] | null
          resulted_in_coverage?: boolean | null
          source_name?: string
          source_url?: string | null
        }
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          lifetime_points_earned: number | null
          lifetime_points_redeemed: number | null
          points_balance: number | null
          tier: string | null
          tier_updated_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          lifetime_points_earned?: number | null
          lifetime_points_redeemed?: number | null
          points_balance?: number | null
          tier?: string | null
          tier_updated_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          lifetime_points_earned?: number | null
          lifetime_points_redeemed?: number | null
          points_balance?: number | null
          tier?: string | null
          tier_updated_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          points_required: number
          reward_type: string
          reward_value: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          points_required: number
          reward_type: string
          reward_value?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          points_required?: number
          reward_type?: string
          reward_value?: number | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          loyalty_account_id: string | null
          points: number
          reference_id: string | null
          reference_type: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          loyalty_account_id?: string | null
          points: number
          reference_id?: string | null
          reference_type?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          loyalty_account_id?: string | null
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_leaderboard"
            referencedColumns: ["account_id"]
          },
        ]
      }
      marketing_calendar: {
        Row: {
          action_deadline_days: number | null
          action_required: string | null
          brevo_campaign_id: number | null
          brevo_list_ids: number[] | null
          created_at: string | null
          description: string | null
          estimated_revenue_impact: number | null
          event_subtype: string | null
          event_type: string
          id: string
          notes: string | null
          remind_1_day: boolean | null
          remind_3_days: boolean | null
          remind_7_days: boolean | null
          remind_day_of: boolean | null
          requires_owner_action: boolean | null
          scheduled_date: string
          scheduled_time: string | null
          season: string | null
          service_type: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_deadline_days?: number | null
          action_required?: string | null
          brevo_campaign_id?: number | null
          brevo_list_ids?: number[] | null
          created_at?: string | null
          description?: string | null
          estimated_revenue_impact?: number | null
          event_subtype?: string | null
          event_type: string
          id?: string
          notes?: string | null
          remind_1_day?: boolean | null
          remind_3_days?: boolean | null
          remind_7_days?: boolean | null
          remind_day_of?: boolean | null
          requires_owner_action?: boolean | null
          scheduled_date: string
          scheduled_time?: string | null
          season?: string | null
          service_type?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_deadline_days?: number | null
          action_required?: string | null
          brevo_campaign_id?: number | null
          brevo_list_ids?: number[] | null
          created_at?: string | null
          description?: string | null
          estimated_revenue_impact?: number | null
          event_subtype?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          remind_1_day?: boolean | null
          remind_3_days?: boolean | null
          remind_7_days?: boolean | null
          remind_day_of?: boolean | null
          requires_owner_action?: boolean | null
          scheduled_date?: string
          scheduled_time?: string | null
          season?: string | null
          service_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_performance_summary: {
        Row: {
          best_performing_creative_id: string | null
          campaigns_sent: number | null
          channel: string
          created_at: string | null
          id: string
          notes: string | null
          roi: number | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          total_revenue: number | null
          total_spend: number | null
          week_start: string
        }
        Insert: {
          best_performing_creative_id?: string | null
          campaigns_sent?: number | null
          channel: string
          created_at?: string | null
          id?: string
          notes?: string | null
          roi?: number | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_revenue?: number | null
          total_spend?: number | null
          week_start: string
        }
        Update: {
          best_performing_creative_id?: string | null
          campaigns_sent?: number | null
          channel?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          roi?: number | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_revenue?: number | null
          total_spend?: number | null
          week_start?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          ai_description: string | null
          ai_descriptions: Json | null
          ai_quality_score: number | null
          ai_tags: string[] | null
          approval_status: string | null
          approved_at: string | null
          before_after_pair_id: string | null
          city: string | null
          created_at: string | null
          distributed_to_ads: boolean | null
          distributed_to_email: boolean | null
          distributed_to_print: boolean | null
          distributed_to_social: boolean | null
          id: string
          is_before_after: boolean | null
          job_id: string | null
          lat: number | null
          lead_id: string | null
          lng: number | null
          location_address: string | null
          performance_score: number | null
          photo_type: string | null
          photo_url: string
          property_type: string | null
          rejection_reason: string | null
          service_type: string | null
          storage_path: string | null
          thumbnail_url: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          updated_at: string | null
          uploaded_by: string | null
          zip: string | null
        }
        Insert: {
          ai_description?: string | null
          ai_descriptions?: Json | null
          ai_quality_score?: number | null
          ai_tags?: string[] | null
          approval_status?: string | null
          approved_at?: string | null
          before_after_pair_id?: string | null
          city?: string | null
          created_at?: string | null
          distributed_to_ads?: boolean | null
          distributed_to_email?: boolean | null
          distributed_to_print?: boolean | null
          distributed_to_social?: boolean | null
          id?: string
          is_before_after?: boolean | null
          job_id?: string | null
          lat?: number | null
          lead_id?: string | null
          lng?: number | null
          location_address?: string | null
          performance_score?: number | null
          photo_type?: string | null
          photo_url: string
          property_type?: string | null
          rejection_reason?: string | null
          service_type?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          zip?: string | null
        }
        Update: {
          ai_description?: string | null
          ai_descriptions?: Json | null
          ai_quality_score?: number | null
          ai_tags?: string[] | null
          approval_status?: string | null
          approved_at?: string | null
          before_after_pair_id?: string | null
          city?: string | null
          created_at?: string | null
          distributed_to_ads?: boolean | null
          distributed_to_email?: boolean | null
          distributed_to_print?: boolean | null
          distributed_to_social?: boolean | null
          id?: string
          is_before_after?: boolean | null
          job_id?: string | null
          lat?: number | null
          lead_id?: string | null
          lng?: number | null
          location_address?: string | null
          performance_score?: number | null
          photo_type?: string | null
          photo_url?: string
          property_type?: string | null
          rejection_reason?: string | null
          service_type?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      media_opportunities: {
        Row: {
          auto_respond: boolean | null
          backlink_obtained: boolean | null
          backlink_type: string | null
          created_at: string | null
          draft_response: string | null
          final_response: string | null
          id: string
          journalist_email: string | null
          journalist_name: string | null
          journalist_twitter: string | null
          outlet_name: string | null
          outlet_reach_estimate: number | null
          outlet_type: string | null
          published_at: string | null
          published_url: string | null
          query_category: string | null
          query_deadline: string | null
          query_text: string | null
          query_title: string
          received_at: string | null
          relevance_factors: Json | null
          relevance_score: number | null
          response_received: boolean | null
          response_sent_at: string | null
          response_status: string | null
          response_type: string | null
          sent_via: string | null
          source: string
          source_email_id: string | null
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_respond?: boolean | null
          backlink_obtained?: boolean | null
          backlink_type?: string | null
          created_at?: string | null
          draft_response?: string | null
          final_response?: string | null
          id?: string
          journalist_email?: string | null
          journalist_name?: string | null
          journalist_twitter?: string | null
          outlet_name?: string | null
          outlet_reach_estimate?: number | null
          outlet_type?: string | null
          published_at?: string | null
          published_url?: string | null
          query_category?: string | null
          query_deadline?: string | null
          query_text?: string | null
          query_title: string
          received_at?: string | null
          relevance_factors?: Json | null
          relevance_score?: number | null
          response_received?: boolean | null
          response_sent_at?: string | null
          response_status?: string | null
          response_type?: string | null
          sent_via?: string | null
          source: string
          source_email_id?: string | null
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_respond?: boolean | null
          backlink_obtained?: boolean | null
          backlink_type?: string | null
          created_at?: string | null
          draft_response?: string | null
          final_response?: string | null
          id?: string
          journalist_email?: string | null
          journalist_name?: string | null
          journalist_twitter?: string | null
          outlet_name?: string | null
          outlet_reach_estimate?: number | null
          outlet_type?: string | null
          published_at?: string | null
          published_url?: string | null
          query_category?: string | null
          query_deadline?: string | null
          query_text?: string | null
          query_title?: string
          received_at?: string | null
          relevance_factors?: Json | null
          relevance_score?: number | null
          response_received?: boolean | null
          response_sent_at?: string | null
          response_status?: string | null
          response_type?: string | null
          sent_via?: string | null
          source?: string
          source_email_id?: string | null
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_usage_log: {
        Row: {
          campaign_id: string | null
          channel: string
          clicks: number | null
          conversions: number | null
          external_post_id: string | null
          id: string
          impressions: number | null
          media_asset_id: string
          revenue_attributed: number | null
          used_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          channel: string
          clicks?: number | null
          conversions?: number | null
          external_post_id?: string | null
          id?: string
          impressions?: number | null
          media_asset_id: string
          revenue_attributed?: number | null
          used_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          clicks?: number | null
          conversions?: number | null
          external_post_id?: string | null
          id?: string
          impressions?: number | null
          media_asset_id?: string
          revenue_attributed?: number | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_log_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_usage_log_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_pending_approval"
            referencedColumns: ["id"]
          },
        ]
      }
      missed_calls: {
        Row: {
          call_sid: string
          call_status: string | null
          caller_name: string | null
          created_at: string | null
          from_phone: string
          id: string
          lead_created: boolean | null
          lead_id: string | null
          sms_response: string | null
          sms_sent_at: string | null
          to_phone: string
        }
        Insert: {
          call_sid: string
          call_status?: string | null
          caller_name?: string | null
          created_at?: string | null
          from_phone: string
          id?: string
          lead_created?: boolean | null
          lead_id?: string | null
          sms_response?: string | null
          sms_sent_at?: string | null
          to_phone: string
        }
        Update: {
          call_sid?: string
          call_status?: string | null
          caller_name?: string | null
          created_at?: string | null
          from_phone?: string
          id?: string
          lead_created?: boolean | null
          lead_id?: string | null
          sms_response?: string | null
          sms_sent_at?: string | null
          to_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "missed_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missed_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missed_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      nap_baseline: {
        Row: {
          address_line1: string
          address_line2: string | null
          business_name: string | null
          city: string | null
          created_at: string | null
          email: string | null
          hours_of_operation: Json | null
          id: string
          known_variations: Json | null
          phone: string
          phone_alt: string | null
          primary_categories: string[] | null
          service_areas: string[] | null
          state: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          hours_of_operation?: Json | null
          id?: string
          known_variations?: Json | null
          phone: string
          phone_alt?: string | null
          primary_categories?: string[] | null
          service_areas?: string[] | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          hours_of_operation?: Json | null
          id?: string
          known_variations?: Json | null
          phone?: string
          phone_alt?: string | null
          primary_categories?: string[] | null
          service_areas?: string[] | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      neighbor_postcard_queue: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          estimated_neighbors: number | null
          id: string
          job_address: string
          job_city: string | null
          job_completed_at: string
          job_id: string
          job_lat: number | null
          job_lng: number | null
          job_state: string | null
          job_total: number | null
          job_zip: string | null
          jobber_customer_id: string | null
          promo_code: string | null
          promo_discount_percent: number | null
          promo_expires_at: string | null
          service_type: string
          status: string
          target_radius_miles: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          estimated_neighbors?: number | null
          id?: string
          job_address: string
          job_city?: string | null
          job_completed_at: string
          job_id: string
          job_lat?: number | null
          job_lng?: number | null
          job_state?: string | null
          job_total?: number | null
          job_zip?: string | null
          jobber_customer_id?: string | null
          promo_code?: string | null
          promo_discount_percent?: number | null
          promo_expires_at?: string | null
          service_type: string
          status?: string
          target_radius_miles?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          estimated_neighbors?: number | null
          id?: string
          job_address?: string
          job_city?: string | null
          job_completed_at?: string
          job_id?: string
          job_lat?: number | null
          job_lng?: number | null
          job_state?: string | null
          job_total?: number | null
          job_zip?: string | null
          jobber_customer_id?: string | null
          promo_code?: string | null
          promo_discount_percent?: number | null
          promo_expires_at?: string | null
          service_type?: string
          status?: string
          target_radius_miles?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      neighbor_postcards_sent: {
        Row: {
          created_at: string | null
          distance_miles: number | null
          id: string
          lob_actual_delivery_date: string | null
          lob_cost_cents: number | null
          lob_expected_delivery_date: string | null
          lob_postcard_id: string | null
          lob_status: string | null
          lob_tracking_number: string | null
          neighbor_address: string
          neighbor_city: string | null
          neighbor_lat: number | null
          neighbor_lng: number | null
          neighbor_state: string | null
          neighbor_zip: string | null
          personalization_data: Json | null
          queue_id: string
          sent_at: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          distance_miles?: number | null
          id?: string
          lob_actual_delivery_date?: string | null
          lob_cost_cents?: number | null
          lob_expected_delivery_date?: string | null
          lob_postcard_id?: string | null
          lob_status?: string | null
          lob_tracking_number?: string | null
          neighbor_address: string
          neighbor_city?: string | null
          neighbor_lat?: number | null
          neighbor_lng?: number | null
          neighbor_state?: string | null
          neighbor_zip?: string | null
          personalization_data?: Json | null
          queue_id: string
          sent_at?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          distance_miles?: number | null
          id?: string
          lob_actual_delivery_date?: string | null
          lob_cost_cents?: number | null
          lob_expected_delivery_date?: string | null
          lob_postcard_id?: string | null
          lob_status?: string | null
          lob_tracking_number?: string | null
          neighbor_address?: string
          neighbor_city?: string | null
          neighbor_lat?: number | null
          neighbor_lng?: number | null
          neighbor_state?: string | null
          neighbor_zip?: string | null
          personalization_data?: Json | null
          queue_id?: string
          sent_at?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighbor_postcards_sent_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "neighbor_postcard_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_scores: {
        Row: {
          avg_service_frequency: number | null
          city: string | null
          clean_score: number | null
          created_at: string | null
          id: string
          last_calculated_at: string | null
          neighborhood_name: string
          properties_serviced: number | null
          rank: number | null
          review_mentions: number | null
          service_penetration: number | null
          top_services: string[] | null
          total_properties_estimated: number | null
          trend: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          avg_service_frequency?: number | null
          city?: string | null
          clean_score?: number | null
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          neighborhood_name: string
          properties_serviced?: number | null
          rank?: number | null
          review_mentions?: number | null
          service_penetration?: number | null
          top_services?: string[] | null
          total_properties_estimated?: number | null
          trend?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          avg_service_frequency?: number | null
          city?: string | null
          clean_score?: number | null
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          neighborhood_name?: string
          properties_serviced?: number | null
          rank?: number | null
          review_mentions?: number | null
          service_penetration?: number | null
          top_services?: string[] | null
          total_properties_estimated?: number | null
          trend?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          notification_type: string
          recipient: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type: string
          recipient?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          recipient?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      nps_surveys: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          job_reference: string | null
          lead_id: string | null
          score: number | null
          sent_at: string | null
          service_type: string | null
          status: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          job_reference?: string | null
          lead_id?: string | null
          score?: number | null
          sent_at?: string | null
          service_type?: string | null
          status?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          job_reference?: string | null
          lead_id?: string | null
          score?: number | null
          sent_at?: string | null
          service_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_surveys_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          campaign_name: string
          campaign_type: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          emails_sent: number | null
          follow_up_template: string | null
          id: string
          initial_email_template: string | null
          links_acquired: number | null
          prospects_found: number | null
          responses_received: number | null
          search_queries: string[] | null
          started_at: string | null
          status: string | null
          target_asset_id: string | null
          target_url: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          campaign_type: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          emails_sent?: number | null
          follow_up_template?: string | null
          id?: string
          initial_email_template?: string | null
          links_acquired?: number | null
          prospects_found?: number | null
          responses_received?: number | null
          search_queries?: string[] | null
          started_at?: string | null
          status?: string | null
          target_asset_id?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          campaign_type?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          emails_sent?: number | null
          follow_up_template?: string | null
          id?: string
          initial_email_template?: string | null
          links_acquired?: number | null
          prospects_found?: number | null
          responses_received?: number | null
          search_queries?: string[] | null
          started_at?: string | null
          status?: string | null
          target_asset_id?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_campaigns_target_asset_id_fkey"
            columns: ["target_asset_id"]
            isOneToOne: false
            referencedRelation: "asset_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_campaigns_target_asset_id_fkey"
            columns: ["target_asset_id"]
            isOneToOne: false
            referencedRelation: "linkable_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_contacts: {
        Row: {
          campaign_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_role: string | null
          created_at: string | null
          domain_authority: number | null
          follow_up_1_sent_at: string | null
          follow_up_2_sent_at: string | null
          id: string
          initial_email_opened: boolean | null
          initial_email_sent_at: string | null
          link_placed: boolean | null
          link_type: string | null
          link_url: string | null
          notes: string | null
          page_url: string | null
          response_received_at: string | null
          response_text: string | null
          site_name: string | null
          site_url: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string | null
          domain_authority?: number | null
          follow_up_1_sent_at?: string | null
          follow_up_2_sent_at?: string | null
          id?: string
          initial_email_opened?: boolean | null
          initial_email_sent_at?: string | null
          link_placed?: boolean | null
          link_type?: string | null
          link_url?: string | null
          notes?: string | null
          page_url?: string | null
          response_received_at?: string | null
          response_text?: string | null
          site_name?: string | null
          site_url: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string | null
          domain_authority?: number | null
          follow_up_1_sent_at?: string | null
          follow_up_2_sent_at?: string | null
          id?: string
          initial_email_opened?: boolean | null
          initial_email_sent_at?: string | null
          link_placed?: boolean | null
          link_type?: string | null
          link_url?: string | null
          notes?: string | null
          page_url?: string | null
          response_received_at?: string | null
          response_text?: string | null
          site_name?: string | null
          site_url?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "outreach_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      page_seo: {
        Row: {
          aeo_content: Json | null
          audit_issues: Json | null
          audited_at: string | null
          created_at: string | null
          howto_schema: Json | null
          id: string
          needs_refresh: boolean | null
          path: string
          rankability_score: number | null
          refreshed_at: string | null
          refreshed_content: string | null
          schema_data: Json | null
          seo_score: number | null
          speakable_schema: Json | null
          speed_score: number | null
          suggested_meta_description: string | null
          updated_at: string | null
        }
        Insert: {
          aeo_content?: Json | null
          audit_issues?: Json | null
          audited_at?: string | null
          created_at?: string | null
          howto_schema?: Json | null
          id?: string
          needs_refresh?: boolean | null
          path: string
          rankability_score?: number | null
          refreshed_at?: string | null
          refreshed_content?: string | null
          schema_data?: Json | null
          seo_score?: number | null
          speakable_schema?: Json | null
          speed_score?: number | null
          suggested_meta_description?: string | null
          updated_at?: string | null
        }
        Update: {
          aeo_content?: Json | null
          audit_issues?: Json | null
          audited_at?: string | null
          created_at?: string | null
          howto_schema?: Json | null
          id?: string
          needs_refresh?: boolean | null
          path?: string
          rankability_score?: number | null
          refreshed_at?: string | null
          refreshed_content?: string | null
          schema_data?: Json | null
          seo_score?: number | null
          speakable_schema?: Json | null
          speed_score?: number | null
          suggested_meta_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_speed_results: {
        Row: {
          checked_at: string | null
          cls: number | null
          id: string
          lcp_ms: number | null
          path: string
          score: number | null
          strategy: string | null
          tbt_ms: number | null
        }
        Insert: {
          checked_at?: string | null
          cls?: number | null
          id?: string
          lcp_ms?: number | null
          path: string
          score?: number | null
          strategy?: string | null
          tbt_ms?: number | null
        }
        Update: {
          checked_at?: string | null
          cls?: number | null
          id?: string
          lcp_ms?: number | null
          path?: string
          score?: number | null
          strategy?: string | null
          tbt_ms?: number | null
        }
        Relationships: []
      }
      partner_outreach_log: {
        Row: {
          bounced: boolean | null
          brevo_message_id: string | null
          call_duration_seconds: number | null
          call_outcome: string | null
          clicked_at: string | null
          created_at: string | null
          id: string
          message_preview: string | null
          opened_at: string | null
          outreach_stage: string
          outreach_type: string
          partner_id: string
          replied_at: string | null
          result: string | null
          result_notes: string | null
          sent_at: string | null
          subject: string | null
        }
        Insert: {
          bounced?: boolean | null
          brevo_message_id?: string | null
          call_duration_seconds?: number | null
          call_outcome?: string | null
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          message_preview?: string | null
          opened_at?: string | null
          outreach_stage: string
          outreach_type: string
          partner_id: string
          replied_at?: string | null
          result?: string | null
          result_notes?: string | null
          sent_at?: string | null
          subject?: string | null
        }
        Update: {
          bounced?: boolean | null
          brevo_message_id?: string | null
          call_duration_seconds?: number | null
          call_outcome?: string | null
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          message_preview?: string | null
          opened_at?: string | null
          outreach_stage?: string
          outreach_type?: string
          partner_id?: string
          replied_at?: string | null
          result?: string | null
          result_notes?: string | null
          sent_at?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_outreach_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_outreach_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          failed_reason: string | null
          id: string
          notification_sent: boolean | null
          notification_sent_at: string | null
          partner_id: string
          payout_amount: number
          payout_method: string
          payout_reference: string | null
          processed_at: string | null
          referral_count: number
          referral_ids: string[]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          failed_reason?: string | null
          id?: string
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          partner_id: string
          payout_amount: number
          payout_method: string
          payout_reference?: string | null
          processed_at?: string | null
          referral_count: number
          referral_ids: string[]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          failed_reason?: string | null
          id?: string
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          partner_id?: string
          payout_amount?: number
          payout_method?: string
          payout_reference?: string | null
          processed_at?: string | null
          referral_count?: number
          referral_ids?: string[]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_referrals: {
        Row: {
          commission_amount: number | null
          commission_paid_at: string | null
          commission_payment_method: string | null
          commission_payment_reference: string | null
          commission_status: string | null
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          job_booked: boolean | null
          job_booked_at: string | null
          job_completed: boolean | null
          job_completed_at: string | null
          job_service_type: string | null
          job_total: number | null
          jobber_job_id: string | null
          partner_code: string
          partner_id: string
          referral_notes: string | null
          referral_source: string | null
          referred_at: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_paid_at?: string | null
          commission_payment_method?: string | null
          commission_payment_reference?: string | null
          commission_status?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          job_booked?: boolean | null
          job_booked_at?: string | null
          job_completed?: boolean | null
          job_completed_at?: string | null
          job_service_type?: string | null
          job_total?: number | null
          jobber_job_id?: string | null
          partner_code: string
          partner_id: string
          referral_notes?: string | null
          referral_source?: string | null
          referred_at?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_paid_at?: string | null
          commission_payment_method?: string | null
          commission_payment_reference?: string | null
          commission_status?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          job_booked?: boolean | null
          job_booked_at?: string | null
          job_completed?: boolean | null
          job_completed_at?: string | null
          job_service_type?: string | null
          job_total?: number | null
          jobber_job_id?: string | null
          partner_code?: string
          partner_id?: string
          referral_notes?: string | null
          referral_source?: string | null
          referred_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          activated_at: string | null
          business_address: string | null
          business_city: string | null
          business_state: string | null
          business_zip: string | null
          commission_amount: number | null
          commission_percentage: number | null
          commission_type: string | null
          company_name: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contact_title: string | null
          created_at: string | null
          first_contact_at: string | null
          first_contact_method: string | null
          id: string
          last_contact_at: string | null
          last_referral_at: string | null
          linkedin_url: string | null
          next_followup_at: string | null
          notes: string | null
          outreach_stage: string | null
          partner_code: string
          partner_type: string
          partner_url: string
          partnership_tier: string | null
          status: string | null
          total_commissions_earned: number | null
          total_commissions_paid: number | null
          total_jobs_booked: number | null
          total_referrals: number | null
          total_revenue_generated: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          activated_at?: string | null
          business_address?: string | null
          business_city?: string | null
          business_state?: string | null
          business_zip?: string | null
          commission_amount?: number | null
          commission_percentage?: number | null
          commission_type?: string | null
          company_name?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          first_contact_at?: string | null
          first_contact_method?: string | null
          id?: string
          last_contact_at?: string | null
          last_referral_at?: string | null
          linkedin_url?: string | null
          next_followup_at?: string | null
          notes?: string | null
          outreach_stage?: string | null
          partner_code: string
          partner_type: string
          partner_url: string
          partnership_tier?: string | null
          status?: string | null
          total_commissions_earned?: number | null
          total_commissions_paid?: number | null
          total_jobs_booked?: number | null
          total_referrals?: number | null
          total_revenue_generated?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          activated_at?: string | null
          business_address?: string | null
          business_city?: string | null
          business_state?: string | null
          business_zip?: string | null
          commission_amount?: number | null
          commission_percentage?: number | null
          commission_type?: string | null
          company_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          first_contact_at?: string | null
          first_contact_method?: string | null
          id?: string
          last_contact_at?: string | null
          last_referral_at?: string | null
          linkedin_url?: string | null
          next_followup_at?: string | null
          notes?: string | null
          outreach_stage?: string | null
          partner_code?: string
          partner_type?: string
          partner_url?: string
          partnership_tier?: string | null
          status?: string | null
          total_commissions_earned?: number | null
          total_commissions_paid?: number | null
          total_jobs_booked?: number | null
          total_referrals?: number | null
          total_revenue_generated?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      postcard_campaigns: {
        Row: {
          conversion_count: number | null
          cost: number | null
          created_at: string | null
          deployed_at: string | null
          id: string
          name: string
          response_count: number | null
          revenue_attributed: number | null
          sent_count: number | null
          status: string | null
          target_area: string | null
          target_zip: string | null
          updated_at: string | null
          variant: string | null
        }
        Insert: {
          conversion_count?: number | null
          cost?: number | null
          created_at?: string | null
          deployed_at?: string | null
          id?: string
          name: string
          response_count?: number | null
          revenue_attributed?: number | null
          sent_count?: number | null
          status?: string | null
          target_area?: string | null
          target_zip?: string | null
          updated_at?: string | null
          variant?: string | null
        }
        Update: {
          conversion_count?: number | null
          cost?: number | null
          created_at?: string | null
          deployed_at?: string | null
          id?: string
          name?: string
          response_count?: number | null
          revenue_attributed?: number | null
          sent_count?: number | null
          status?: string | null
          target_area?: string | null
          target_zip?: string | null
          updated_at?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      postcard_qr_scans: {
        Row: {
          converted: boolean | null
          converted_at: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          page_views: number | null
          promo_code: string
          queue_id: string | null
          referrer: string | null
          scan_city: string | null
          scan_region: string | null
          scanned_at: string | null
          session_id: string | null
          time_on_page: number | null
          user_agent: string | null
        }
        Insert: {
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_views?: number | null
          promo_code: string
          queue_id?: string | null
          referrer?: string | null
          scan_city?: string | null
          scan_region?: string | null
          scanned_at?: string | null
          session_id?: string | null
          time_on_page?: number | null
          user_agent?: string | null
        }
        Update: {
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_views?: number | null
          promo_code?: string
          queue_id?: string | null
          referrer?: string | null
          scan_city?: string | null
          scan_region?: string | null
          scanned_at?: string | null
          session_id?: string | null
          time_on_page?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postcard_qr_scans_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "neighbor_postcard_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      postcard_redemptions: {
        Row: {
          conversion_source: string | null
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_applied: number | null
          id: string
          job_booked: boolean | null
          job_booked_at: string | null
          job_service_type: string | null
          job_total: number | null
          jobber_job_id: string | null
          promo_code: string
          qr_scan_at: string | null
          queue_id: string
          redeemed_at: string | null
        }
        Insert: {
          conversion_source?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_applied?: number | null
          id?: string
          job_booked?: boolean | null
          job_booked_at?: string | null
          job_service_type?: string | null
          job_total?: number | null
          jobber_job_id?: string | null
          promo_code: string
          qr_scan_at?: string | null
          queue_id: string
          redeemed_at?: string | null
        }
        Update: {
          conversion_source?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_applied?: number | null
          id?: string
          job_booked?: boolean | null
          job_booked_at?: string | null
          job_service_type?: string | null
          job_total?: number | null
          jobber_job_id?: string | null
          promo_code?: string
          qr_scan_at?: string | null
          queue_id?: string
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postcard_redemptions_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "neighbor_postcard_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      press_releases: {
        Row: {
          backlink_urls: string[] | null
          backlinks_obtained: number | null
          created_at: string | null
          distribution_channels: string[] | null
          distribution_date: string | null
          distribution_status: string | null
          full_content: string | null
          id: string
          milestone_type: string | null
          pickup_urls: string[] | null
          pickups_count: number | null
          summary: string | null
          target_keywords: string[] | null
          title: string
          total_cost: number | null
          triggered_by: string | null
          updated_at: string | null
        }
        Insert: {
          backlink_urls?: string[] | null
          backlinks_obtained?: number | null
          created_at?: string | null
          distribution_channels?: string[] | null
          distribution_date?: string | null
          distribution_status?: string | null
          full_content?: string | null
          id?: string
          milestone_type?: string | null
          pickup_urls?: string[] | null
          pickups_count?: number | null
          summary?: string | null
          target_keywords?: string[] | null
          title: string
          total_cost?: number | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Update: {
          backlink_urls?: string[] | null
          backlinks_obtained?: number | null
          created_at?: string | null
          distribution_channels?: string[] | null
          distribution_date?: string | null
          distribution_status?: string | null
          full_content?: string | null
          id?: string
          milestone_type?: string | null
          pickup_urls?: string[] | null
          pickups_count?: number | null
          summary?: string | null
          target_keywords?: string[] | null
          title?: string
          total_cost?: number | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_bundle_services: {
        Row: {
          bundle_id: string
          default_price_type: string | null
          default_size_key: string | null
          default_tier: string | null
          id: string
          service_id: string
          sort_order: number | null
        }
        Insert: {
          bundle_id: string
          default_price_type?: string | null
          default_size_key?: string | null
          default_tier?: string | null
          id?: string
          service_id: string
          sort_order?: number | null
        }
        Update: {
          bundle_id?: string
          default_price_type?: string | null
          default_size_key?: string | null
          default_tier?: string | null
          id?: string
          service_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_bundle_services_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "pricing_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_bundle_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pricing_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_bundles: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percent: number
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percent: number
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      pricing_multipliers: {
        Row: {
          applies_to: string[] | null
          created_at: string | null
          description: string | null
          flat_amount: number | null
          id: string
          max_discount_cap: number | null
          multiplier: number | null
          multiplier_type: string
          name: string
          slug: string
          sort_order: number | null
          stackable: boolean | null
          updated_at: string | null
        }
        Insert: {
          applies_to?: string[] | null
          created_at?: string | null
          description?: string | null
          flat_amount?: number | null
          id?: string
          max_discount_cap?: number | null
          multiplier?: number | null
          multiplier_type: string
          name: string
          slug: string
          sort_order?: number | null
          stackable?: boolean | null
          updated_at?: string | null
        }
        Update: {
          applies_to?: string[] | null
          created_at?: string | null
          description?: string | null
          flat_amount?: number | null
          id?: string
          max_discount_cap?: number | null
          multiplier?: number | null
          multiplier_type?: string
          name?: string
          slug?: string
          sort_order?: number | null
          stackable?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_performance: {
        Row: {
          accepted: boolean | null
          actual_revenue: number | null
          created_at: string | null
          house_size: string | null
          id: string
          quote_source: string | null
          quoted_price: number | null
          season: string | null
          service_type: string
        }
        Insert: {
          accepted?: boolean | null
          actual_revenue?: number | null
          created_at?: string | null
          house_size?: string | null
          id?: string
          quote_source?: string | null
          quoted_price?: number | null
          season?: string | null
          service_type: string
        }
        Update: {
          accepted?: boolean | null
          actual_revenue?: number | null
          created_at?: string | null
          house_size?: string | null
          id?: string
          quote_source?: string | null
          quoted_price?: number | null
          season?: string | null
          service_type?: string
        }
        Relationships: []
      }
      pricing_rates: {
        Row: {
          created_at: string | null
          id: string
          includes: string[] | null
          price: number
          price_max: number | null
          price_type: string
          service_id: string
          size_key: string
          size_label: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          includes?: string[] | null
          price: number
          price_max?: number | null
          price_type?: string
          service_id: string
          size_key: string
          size_label: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          includes?: string[] | null
          price?: number
          price_max?: number | null
          price_type?: string
          service_id?: string
          size_key?: string
          size_label?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pricing_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_recommendations: {
        Row: {
          acceptance_rate: number | null
          applied: boolean | null
          confidence: string | null
          created_at: string | null
          current_avg_price: number | null
          house_size: string | null
          id: string
          recommendation: string | null
          recommended_price: number | null
          sample_size: number | null
          season: string | null
          service_type: string
        }
        Insert: {
          acceptance_rate?: number | null
          applied?: boolean | null
          confidence?: string | null
          created_at?: string | null
          current_avg_price?: number | null
          house_size?: string | null
          id?: string
          recommendation?: string | null
          recommended_price?: number | null
          sample_size?: number | null
          season?: string | null
          service_type: string
        }
        Update: {
          acceptance_rate?: number | null
          applied?: boolean | null
          confidence?: string | null
          created_at?: string | null
          current_avg_price?: number | null
          house_size?: string | null
          id?: string
          recommendation?: string | null
          recommended_price?: number | null
          sample_size?: number | null
          season?: string | null
          service_type?: string
        }
        Relationships: []
      }
      pricing_services: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          estimated_hours: Json | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          minimum_one_time: number | null
          minimum_recurring: number | null
          name: string
          notes: string | null
          per_unit_label: string | null
          per_unit_price: number | null
          pricing_model: string
          season_end_month: number | null
          season_start_month: number | null
          seasonal_only: boolean | null
          size_system: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_hours?: Json | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          minimum_one_time?: number | null
          minimum_recurring?: number | null
          name: string
          notes?: string | null
          per_unit_label?: string | null
          per_unit_price?: number | null
          pricing_model?: string
          season_end_month?: number | null
          season_start_month?: number | null
          seasonal_only?: boolean | null
          size_system?: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_hours?: Json | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          minimum_one_time?: number | null
          minimum_recurring?: number | null
          name?: string
          notes?: string | null
          per_unit_label?: string | null
          per_unit_price?: number | null
          pricing_model?: string
          season_end_month?: number | null
          season_start_month?: number | null
          seasonal_only?: boolean | null
          size_system?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_settings: {
        Row: {
          created_at: string
          discount: string
          display_order: number
          duration_hours: number
          id: string
          is_active: boolean
          path: string
          seasons: Json
          service: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount: string
          display_order?: number
          duration_hours?: number
          id?: string
          is_active?: boolean
          path: string
          seasons?: Json
          service: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string
          display_order?: number
          duration_hours?: number
          id?: string
          is_active?: boolean
          path?: string
          seasons?: Json
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          created_at: string | null
          id: string
          job_booked: boolean | null
          job_booked_at: string | null
          job_completed: boolean | null
          job_completed_at: string | null
          job_service_type: string | null
          job_total: number | null
          jobber_job_id: string | null
          referee_address: string | null
          referee_discount_applied: boolean | null
          referee_email: string | null
          referee_name: string | null
          referee_phone: string | null
          referral_code: string
          referral_program_id: string | null
          referral_source: string | null
          referred_at: string | null
          referrer_reward_paid_at: string | null
          referrer_reward_status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_booked?: boolean | null
          job_booked_at?: string | null
          job_completed?: boolean | null
          job_completed_at?: string | null
          job_service_type?: string | null
          job_total?: number | null
          jobber_job_id?: string | null
          referee_address?: string | null
          referee_discount_applied?: boolean | null
          referee_email?: string | null
          referee_name?: string | null
          referee_phone?: string | null
          referral_code: string
          referral_program_id?: string | null
          referral_source?: string | null
          referred_at?: string | null
          referrer_reward_paid_at?: string | null
          referrer_reward_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_booked?: boolean | null
          job_booked_at?: string | null
          job_completed?: boolean | null
          job_completed_at?: string | null
          job_service_type?: string | null
          job_total?: number | null
          jobber_job_id?: string | null
          referee_address?: string | null
          referee_discount_applied?: boolean | null
          referee_email?: string | null
          referee_name?: string | null
          referee_phone?: string | null
          referral_code?: string
          referral_program_id?: string | null
          referral_source?: string | null
          referred_at?: string | null
          referrer_reward_paid_at?: string | null
          referrer_reward_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referral_program_id_fkey"
            columns: ["referral_program_id"]
            isOneToOne: false
            referencedRelation: "referral_program"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_program: {
        Row: {
          created_at: string | null
          enrolled_at: string | null
          expires_at: string | null
          id: string
          jobber_customer_id: string | null
          referee_reward_amount: number | null
          referee_reward_code: string | null
          referee_reward_type: string | null
          referral_code: string
          referral_url: string
          referrer_email: string
          referrer_name: string | null
          referrer_phone: string | null
          referrer_reward_amount: number | null
          referrer_reward_type: string | null
          status: string | null
          total_jobs_booked: number | null
          total_referrals: number | null
          total_rewards_earned: number | null
          total_rewards_paid: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          jobber_customer_id?: string | null
          referee_reward_amount?: number | null
          referee_reward_code?: string | null
          referee_reward_type?: string | null
          referral_code: string
          referral_url: string
          referrer_email: string
          referrer_name?: string | null
          referrer_phone?: string | null
          referrer_reward_amount?: number | null
          referrer_reward_type?: string | null
          status?: string | null
          total_jobs_booked?: number | null
          total_referrals?: number | null
          total_rewards_earned?: number | null
          total_rewards_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          jobber_customer_id?: string | null
          referee_reward_amount?: number | null
          referee_reward_code?: string | null
          referee_reward_type?: string | null
          referral_code?: string
          referral_url?: string
          referrer_email?: string
          referrer_name?: string | null
          referrer_phone?: string | null
          referrer_reward_amount?: number | null
          referrer_reward_type?: string | null
          status?: string | null
          total_jobs_booked?: number | null
          total_referrals?: number | null
          total_rewards_earned?: number | null
          total_rewards_paid?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_attribution: {
        Row: {
          attributed_at: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          jobber_job_id: string | null
          lead_id: string | null
          lead_source: string | null
          revenue: number
          service_type: string | null
        }
        Insert: {
          attributed_at?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          jobber_job_id?: string | null
          lead_id?: string | null
          lead_source?: string | null
          revenue: number
          service_type?: string | null
        }
        Update: {
          attributed_at?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          jobber_job_id?: string | null
          lead_id?: string | null
          lead_source?: string | null
          revenue?: number
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_attribution_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      review_referral_bridge: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string | null
          id: string
          referral_code: string | null
          referral_code_used: boolean | null
          referral_offer_sent: boolean | null
          referral_offer_sent_at: string | null
          referral_program_id: string | null
          review_id: string | null
          review_left: boolean | null
          review_left_at: string | null
          review_request_id: string | null
          triggered_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          id?: string
          referral_code?: string | null
          referral_code_used?: boolean | null
          referral_offer_sent?: boolean | null
          referral_offer_sent_at?: string | null
          referral_program_id?: string | null
          review_id?: string | null
          review_left?: boolean | null
          review_left_at?: string | null
          review_request_id?: string | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          referral_code?: string | null
          referral_code_used?: boolean | null
          referral_offer_sent?: boolean | null
          referral_offer_sent_at?: string | null
          referral_program_id?: string | null
          review_id?: string | null
          review_left?: boolean | null
          review_left_at?: string | null
          review_request_id?: string | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_referral_bridge_referral_program_id_fkey"
            columns: ["referral_program_id"]
            isOneToOne: false
            referencedRelation: "referral_program"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_referral_bridge_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_referral_bridge_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      review_request_links: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          destination_url: string | null
          google_review_url: string
          id: string
          is_active: boolean | null
          label: string | null
          link_type: string
          qr_code_url: string | null
          review_count: number | null
          scan_count: number | null
          short_url: string | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          destination_url?: string | null
          google_review_url: string
          id?: string
          is_active?: boolean | null
          label?: string | null
          link_type: string
          qr_code_url?: string | null
          review_count?: number | null
          scan_count?: number | null
          short_url?: string | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          destination_url?: string | null
          google_review_url?: string
          id?: string
          is_active?: boolean | null
          label?: string | null
          link_type?: string
          qr_code_url?: string | null
          review_count?: number | null
          scan_count?: number | null
          short_url?: string | null
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          brevo_message_id: string | null
          clicked_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string | null
          id: string
          job_completed_at: string | null
          job_id: string | null
          jobber_customer_id: string | null
          opened_at: string | null
          request_type: string
          review_id: string | null
          review_received: boolean | null
          sent_at: string | null
          service_type: string | null
          template_id: number | null
          total_services: number | null
        }
        Insert: {
          brevo_message_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          id?: string
          job_completed_at?: string | null
          job_id?: string | null
          jobber_customer_id?: string | null
          opened_at?: string | null
          request_type: string
          review_id?: string | null
          review_received?: boolean | null
          sent_at?: string | null
          service_type?: string | null
          template_id?: number | null
          total_services?: number | null
        }
        Update: {
          brevo_message_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          job_completed_at?: string | null
          job_id?: string | null
          jobber_customer_id?: string | null
          opened_at?: string | null
          request_type?: string
          review_id?: string | null
          review_received?: boolean | null
          sent_at?: string | null
          service_type?: string | null
          template_id?: number | null
          total_services?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          attribution_method: string | null
          author_email: string | null
          author_name: string | null
          created_at: string | null
          fetched_at: string | null
          google_review_id: string | null
          id: string
          matched_request_id: string | null
          published_at: string | null
          rating: number
          replied_at: string | null
          review_reply: string | null
          review_text: string | null
          source: string | null
        }
        Insert: {
          attribution_method?: string | null
          author_email?: string | null
          author_name?: string | null
          created_at?: string | null
          fetched_at?: string | null
          google_review_id?: string | null
          id?: string
          matched_request_id?: string | null
          published_at?: string | null
          rating: number
          replied_at?: string | null
          review_reply?: string | null
          review_text?: string | null
          source?: string | null
        }
        Update: {
          attribution_method?: string | null
          author_email?: string | null
          author_name?: string | null
          created_at?: string | null
          fetched_at?: string | null
          google_review_id?: string | null
          id?: string
          matched_request_id?: string | null
          published_at?: string | null
          rating?: number
          replied_at?: string | null
          review_reply?: string | null
          review_text?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_matched_request_id_fkey"
            columns: ["matched_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rfp_opportunities: {
        Row: {
          award_amount: number | null
          award_date: string | null
          bid_amount: number | null
          bid_status: string | null
          bid_submitted_at: string | null
          created_at: string | null
          estimated_value: number | null
          id: string
          is_relevant: boolean | null
          notes: string | null
          org_id: string | null
          pass_reason: string | null
          posted_date: string | null
          questions_deadline: string | null
          raw_text: string | null
          relevance_score: number | null
          rfp_number: string | null
          rfp_title: string
          services_requested: string[] | null
          source_portal: string | null
          source_url: string | null
          submission_deadline: string
          updated_at: string | null
        }
        Insert: {
          award_amount?: number | null
          award_date?: string | null
          bid_amount?: number | null
          bid_status?: string | null
          bid_submitted_at?: string | null
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          is_relevant?: boolean | null
          notes?: string | null
          org_id?: string | null
          pass_reason?: string | null
          posted_date?: string | null
          questions_deadline?: string | null
          raw_text?: string | null
          relevance_score?: number | null
          rfp_number?: string | null
          rfp_title: string
          services_requested?: string[] | null
          source_portal?: string | null
          source_url?: string | null
          submission_deadline: string
          updated_at?: string | null
        }
        Update: {
          award_amount?: number | null
          award_date?: string | null
          bid_amount?: number | null
          bid_status?: string | null
          bid_submitted_at?: string | null
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          is_relevant?: boolean | null
          notes?: string | null
          org_id?: string | null
          pass_reason?: string | null
          posted_date?: string | null
          questions_deadline?: string | null
          raw_text?: string | null
          relevance_score?: number | null
          rfp_number?: string | null
          rfp_title?: string
          services_requested?: string[] | null
          source_portal?: string | null
          source_url?: string | null
          submission_deadline?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfp_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_followup_queue"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "rfp_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfp_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "vendor_list_renewal_alerts"
            referencedColumns: ["org_id"]
          },
        ]
      }
      saved_quotes: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          jobber_estimate_id: string | null
          jobber_invoice_id: string | null
          jobber_job_id: string | null
          lead_id: string | null
          notes: string | null
          pipeline_status: string
          quote_data: Json
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          jobber_estimate_id?: string | null
          jobber_invoice_id?: string | null
          jobber_job_id?: string | null
          lead_id?: string | null
          notes?: string | null
          pipeline_status?: string
          quote_data: Json
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          jobber_estimate_id?: string | null
          jobber_invoice_id?: string | null
          jobber_job_id?: string | null
          lead_id?: string | null
          notes?: string | null
          pipeline_status?: string
          quote_data?: Json
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      season_override: {
        Row: {
          active_override: string
          created_at: string
          id: string
          preview_mode: boolean
          preview_season: string | null
          updated_at: string
        }
        Insert: {
          active_override?: string
          created_at?: string
          id?: string
          preview_mode?: boolean
          preview_season?: string | null
          updated_at?: string
        }
        Update: {
          active_override?: string
          created_at?: string
          id?: string
          preview_mode?: boolean
          preview_season?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      season_settings: {
        Row: {
          created_at: string
          end_day: number
          end_month: number
          id: string
          season: string
          start_day: number
          start_month: number
          theme_colors: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_day: number
          end_month: number
          id?: string
          season: string
          start_day: number
          start_month: number
          theme_colors?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_day?: number
          end_month?: number
          id?: string
          season?: string
          start_day?: number
          start_month?: number
          theme_colors?: Json
          updated_at?: string
        }
        Relationships: []
      }
      seasonal_priority_services: {
        Row: {
          badge_text: string | null
          bundle_discount: string | null
          created_at: string
          id: string
          is_active: boolean
          is_bundle: boolean
          limited_slots: boolean
          season: string
          service_description: string | null
          service_name: string
          service_order: number
          service_path: string
          slots_remaining: number | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          bundle_discount?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_bundle?: boolean
          limited_slots?: boolean
          season: string
          service_description?: string | null
          service_name: string
          service_order?: number
          service_path: string
          slots_remaining?: number | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          bundle_discount?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_bundle?: boolean
          limited_slots?: boolean
          season?: string
          service_description?: string | null
          service_name?: string
          service_order?: number
          service_path?: string
          slots_remaining?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      seasonal_slides: {
        Row: {
          background_image_url: string | null
          bullets: Json
          created_at: string
          headline: string
          id: string
          is_active: boolean
          primary_cta_link: string
          primary_cta_text: string
          season: string
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          slide_order: number
          trust_chips: Json
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          bullets?: Json
          created_at?: string
          headline: string
          id?: string
          is_active?: boolean
          primary_cta_link?: string
          primary_cta_text?: string
          season: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          slide_order?: number
          trust_chips?: Json
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          bullets?: Json
          created_at?: string
          headline?: string
          id?: string
          is_active?: boolean
          primary_cta_link?: string
          primary_cta_text?: string
          season?: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          slide_order?: number
          trust_chips?: Json
          updated_at?: string
        }
        Relationships: []
      }
      seo_config: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      seo_content_gaps: {
        Row: {
          avg_position: number | null
          clicks: number | null
          created_at: string | null
          detected_at: string
          has_dedicated_page: boolean | null
          id: string
          impressions: number | null
          priority_score: number | null
          query: string
          status: string | null
          suggested_page_type: string | null
        }
        Insert: {
          avg_position?: number | null
          clicks?: number | null
          created_at?: string | null
          detected_at: string
          has_dedicated_page?: boolean | null
          id?: string
          impressions?: number | null
          priority_score?: number | null
          query: string
          status?: string | null
          suggested_page_type?: string | null
        }
        Update: {
          avg_position?: number | null
          clicks?: number | null
          created_at?: string | null
          detected_at?: string
          has_dedicated_page?: boolean | null
          id?: string
          impressions?: number | null
          priority_score?: number | null
          query?: string
          status?: string | null
          suggested_page_type?: string | null
        }
        Relationships: []
      }
      seo_heal_log: {
        Row: {
          action: string
          after_state: Json | null
          before_state: Json | null
          created_at: string | null
          id: string
          issue_type: string | null
          url: string
        }
        Insert: {
          action: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          id?: string
          issue_type?: string | null
          url: string
        }
        Update: {
          action?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          id?: string
          issue_type?: string | null
          url?: string
        }
        Relationships: []
      }
      seo_heal_queue: {
        Row: {
          created_at: string | null
          details: Json | null
          fixed_at: string | null
          id: string
          issue_type: string
          severity: string
          status: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          fixed_at?: string | null
          id?: string
          issue_type: string
          severity?: string
          status?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          fixed_at?: string | null
          id?: string
          issue_type?: string
          severity?: string
          status?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      seo_health_scores: {
        Row: {
          alt_pct: number | null
          audit_pass_pct: number | null
          breakdown: Json | null
          freshness_pct: number | null
          id: string
          issue_free_pct: number | null
          link_pct: number | null
          overall_score: number
          schema_pct: number | null
          scored_at: string | null
          total_issues: number | null
          total_pages: number | null
        }
        Insert: {
          alt_pct?: number | null
          audit_pass_pct?: number | null
          breakdown?: Json | null
          freshness_pct?: number | null
          id?: string
          issue_free_pct?: number | null
          link_pct?: number | null
          overall_score?: number
          schema_pct?: number | null
          scored_at?: string | null
          total_issues?: number | null
          total_pages?: number | null
        }
        Update: {
          alt_pct?: number | null
          audit_pass_pct?: number | null
          breakdown?: Json | null
          freshness_pct?: number | null
          id?: string
          issue_free_pct?: number | null
          link_pct?: number | null
          overall_score?: number
          schema_pct?: number | null
          scored_at?: string | null
          total_issues?: number | null
          total_pages?: number | null
        }
        Relationships: []
      }
      seo_intelligence_log: {
        Row: {
          applied: boolean
          applied_at: string | null
          change_type: string
          created_at: string
          detected_at: string
          id: string
          impact_assessment: string | null
          recommended_actions: Json | null
          relevance_score: number | null
          source: string
          source_url: string | null
          summary: string
          title: string
        }
        Insert: {
          applied?: boolean
          applied_at?: string | null
          change_type: string
          created_at?: string
          detected_at?: string
          id?: string
          impact_assessment?: string | null
          recommended_actions?: Json | null
          relevance_score?: number | null
          source: string
          source_url?: string | null
          summary: string
          title: string
        }
        Update: {
          applied?: boolean
          applied_at?: string | null
          change_type?: string
          created_at?: string
          detected_at?: string
          id?: string
          impact_assessment?: string | null
          recommended_actions?: Json | null
          relevance_score?: number | null
          source?: string
          source_url?: string | null
          summary?: string
          title?: string
        }
        Relationships: []
      }
      seo_location_pages: {
        Row: {
          ai_generated: boolean | null
          ai_generated_at: string | null
          ai_model: string | null
          city: string
          content: string | null
          created_at: string | null
          h1_text: string | null
          id: string
          leads_generated: number | null
          meta_description: string | null
          page_title: string | null
          page_views: number | null
          published_at: string | null
          secondary_keywords: string[] | null
          service_type: string
          slug: string
          status: string | null
          target_keyword: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_generated_at?: string | null
          ai_model?: string | null
          city: string
          content?: string | null
          created_at?: string | null
          h1_text?: string | null
          id?: string
          leads_generated?: number | null
          meta_description?: string | null
          page_title?: string | null
          page_views?: number | null
          published_at?: string | null
          secondary_keywords?: string[] | null
          service_type: string
          slug: string
          status?: string | null
          target_keyword?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_generated_at?: string | null
          ai_model?: string | null
          city?: string
          content?: string | null
          created_at?: string | null
          h1_text?: string | null
          id?: string
          leads_generated?: number | null
          meta_description?: string | null
          page_title?: string | null
          page_views?: number | null
          published_at?: string | null
          secondary_keywords?: string[] | null
          service_type?: string
          slug?: string
          status?: string | null
          target_keyword?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_redirects: {
        Row: {
          created_at: string | null
          created_by: string | null
          destination_path: string
          hit_count: number | null
          id: string
          source_path: string
          status_code: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          destination_path: string
          hit_count?: number | null
          id?: string
          source_path: string
          status_code?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          destination_path?: string
          hit_count?: number | null
          id?: string
          source_path?: string
          status_code?: number | null
        }
        Relationships: []
      }
      seo_target_cities: {
        Row: {
          active: boolean | null
          city: string
          county: string | null
          created_at: string | null
          distance_from_madison_miles: number | null
          id: string
          population: number | null
          priority: string | null
          state: string | null
        }
        Insert: {
          active?: boolean | null
          city: string
          county?: string | null
          created_at?: string | null
          distance_from_madison_miles?: number | null
          id?: string
          population?: number | null
          priority?: string | null
          state?: string | null
        }
        Update: {
          active?: boolean | null
          city?: string
          county?: string | null
          created_at?: string | null
          distance_from_madison_miles?: number | null
          id?: string
          population?: number | null
          priority?: string | null
          state?: string | null
        }
        Relationships: []
      }
      seo_tasks: {
        Row: {
          applied_at: string | null
          auto_apply_at: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          priority: number
          rejected_at: string | null
          source_workflow: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          auto_apply_at?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: number
          rejected_at?: string | null
          source_workflow?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          auto_apply_at?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: number
          rejected_at?: string | null
          source_workflow?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_weekly_reports: {
        Row: {
          avg_position: number | null
          created_at: string | null
          declining_pages: Json | null
          generated_at: string | null
          heal_actions: Json | null
          health_score_trend: Json | null
          id: string
          issues_by_type: Json | null
          new_keywords: Json | null
          report_data: Json
          sent_at: string | null
          top_gaining_keywords: Json | null
          top_losing_keywords: Json | null
          top_problematic_pages: Json | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          total_sessions: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          avg_position?: number | null
          created_at?: string | null
          declining_pages?: Json | null
          generated_at?: string | null
          heal_actions?: Json | null
          health_score_trend?: Json | null
          id?: string
          issues_by_type?: Json | null
          new_keywords?: Json | null
          report_data?: Json
          sent_at?: string | null
          top_gaining_keywords?: Json | null
          top_losing_keywords?: Json | null
          top_problematic_pages?: Json | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_sessions?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          avg_position?: number | null
          created_at?: string | null
          declining_pages?: Json | null
          generated_at?: string | null
          heal_actions?: Json | null
          health_score_trend?: Json | null
          id?: string
          issues_by_type?: Json | null
          new_keywords?: Json | null
          report_data?: Json
          sent_at?: string | null
          top_gaining_keywords?: Json | null
          top_losing_keywords?: Json | null
          top_problematic_pages?: Json | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_sessions?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      sequence_accounts: {
        Row: {
          account_type: string | null
          balance_cents: number | null
          balance_dollars: number | null
          created_at: string | null
          currency: string | null
          id: string
          institution_name: string | null
          last_synced_at: string | null
          metadata: Json | null
          name: string
          sequence_id: string
        }
        Insert: {
          account_type?: string | null
          balance_cents?: number | null
          balance_dollars?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_name?: string | null
          last_synced_at?: string | null
          metadata?: Json | null
          name: string
          sequence_id: string
        }
        Update: {
          account_type?: string | null
          balance_cents?: number | null
          balance_dollars?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_name?: string | null
          last_synced_at?: string | null
          metadata?: Json | null
          name?: string
          sequence_id?: string
        }
        Relationships: []
      }
      sequence_billers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sequence_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sequence_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sequence_id?: string
        }
        Relationships: []
      }
      sequence_enrollments: {
        Row: {
          completed_at: string | null
          contact_email: string
          current_step: number | null
          enrolled_at: string | null
          id: string
          next_send_at: string | null
          sequence_name: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          contact_email: string
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          next_send_at?: string | null
          sequence_name: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          contact_email?: string
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          next_send_at?: string | null
          sequence_name?: string
          status?: string | null
        }
        Relationships: []
      }
      sequence_goals: {
        Row: {
          achieved_at: string | null
          contact_email: string
          created_at: string | null
          goal_achieved: string
          id: string
          metadata: Json | null
          sequence_name: string
        }
        Insert: {
          achieved_at?: string | null
          contact_email: string
          created_at?: string | null
          goal_achieved: string
          id?: string
          metadata?: Json | null
          sequence_name: string
        }
        Update: {
          achieved_at?: string | null
          contact_email?: string
          created_at?: string | null
          goal_achieved?: string
          id?: string
          metadata?: Json | null
          sequence_name?: string
        }
        Relationships: []
      }
      sms_consent: {
        Row: {
          consent_method: string | null
          consent_status: string
          consent_text: string | null
          created_at: string | null
          customer_name: string | null
          email: string | null
          id: string
          ip_address: string | null
          jobber_customer_id: string | null
          opt_out_reason: string | null
          opted_in_at: string | null
          opted_out_at: string | null
          page_url: string | null
          phone: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          consent_method?: string | null
          consent_status?: string
          consent_text?: string | null
          created_at?: string | null
          customer_name?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          jobber_customer_id?: string | null
          opt_out_reason?: string | null
          opted_in_at?: string | null
          opted_out_at?: string | null
          page_url?: string | null
          phone: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          consent_method?: string | null
          consent_status?: string
          consent_text?: string | null
          created_at?: string | null
          customer_name?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          jobber_customer_id?: string | null
          opt_out_reason?: string | null
          opted_in_at?: string | null
          opted_out_at?: string | null
          page_url?: string | null
          phone?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      sms_sends: {
        Row: {
          ab_test_id: string | null
          ab_variant_id: string | null
          created_at: string | null
          delivered_at: string | null
          external_message_id: string | null
          failed_at: string | null
          failure_reason: string | null
          from_phone: string | null
          id: string
          message_body: string
          message_type: string | null
          sent_at: string | null
          status: string | null
          to_phone: string
          workflow_name: string | null
        }
        Insert: {
          ab_test_id?: string | null
          ab_variant_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          from_phone?: string | null
          id?: string
          message_body: string
          message_type?: string | null
          sent_at?: string | null
          status?: string | null
          to_phone: string
          workflow_name?: string | null
        }
        Update: {
          ab_test_id?: string | null
          ab_variant_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          from_phone?: string | null
          id?: string
          message_body?: string
          message_type?: string | null
          sent_at?: string | null
          status?: string | null
          to_phone?: string
          workflow_name?: string | null
        }
        Relationships: []
      }
      social_engagement_pulls: {
        Row: {
          clicks: number | null
          comments: number | null
          external_post_id: string | null
          follower_change: number | null
          id: string
          impressions: number | null
          likes: number | null
          platform: string
          profile_visits: number | null
          pulled_at: string | null
          raw_data: Json | null
          reach: number | null
          saves: number | null
          shares: number | null
          social_post_id: string | null
          video_views: number | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          external_post_id?: string | null
          follower_change?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform: string
          profile_visits?: number | null
          pulled_at?: string | null
          raw_data?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          social_post_id?: string | null
          video_views?: number | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          external_post_id?: string | null
          follower_change?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform?: string
          profile_visits?: number | null
          pulled_at?: string | null
          raw_data?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          social_post_id?: string | null
          video_views?: number | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          content_fb: string | null
          content_idea_id: string | null
          content_ig: string | null
          created_at: string | null
          hashtags: string | null
          id: string
          posted_at: string | null
          season: string | null
          status: string | null
        }
        Insert: {
          content_fb?: string | null
          content_idea_id?: string | null
          content_ig?: string | null
          created_at?: string | null
          hashtags?: string | null
          id?: string
          posted_at?: string | null
          season?: string | null
          status?: string | null
        }
        Update: {
          content_fb?: string | null
          content_idea_id?: string | null
          content_ig?: string | null
          created_at?: string | null
          hashtags?: string | null
          id?: string
          posted_at?: string | null
          season?: string | null
          status?: string | null
        }
        Relationships: []
      }
      sponsorship_opportunities: {
        Row: {
          actual_cost: number | null
          backlink_included: boolean | null
          backlinks_obtained: string[] | null
          benefits: string[] | null
          created_at: string | null
          decision_deadline: string | null
          decision_notes: string | null
          discovered_at: string | null
          estimated_reach: number | null
          event_date: string | null
          event_name: string
          event_type: string | null
          event_url: string | null
          id: string
          leads_generated: number | null
          maximum_cost: number | null
          minimum_cost: number | null
          organizer: string | null
          participated: boolean | null
          photos_urls: string[] | null
          relevance_score: number | null
          sponsorship_levels: Json | null
          status: string | null
          target_audience: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          backlink_included?: boolean | null
          backlinks_obtained?: string[] | null
          benefits?: string[] | null
          created_at?: string | null
          decision_deadline?: string | null
          decision_notes?: string | null
          discovered_at?: string | null
          estimated_reach?: number | null
          event_date?: string | null
          event_name: string
          event_type?: string | null
          event_url?: string | null
          id?: string
          leads_generated?: number | null
          maximum_cost?: number | null
          minimum_cost?: number | null
          organizer?: string | null
          participated?: boolean | null
          photos_urls?: string[] | null
          relevance_score?: number | null
          sponsorship_levels?: Json | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          backlink_included?: boolean | null
          backlinks_obtained?: string[] | null
          benefits?: string[] | null
          created_at?: string | null
          decision_deadline?: string | null
          decision_notes?: string | null
          discovered_at?: string | null
          estimated_reach?: number | null
          event_date?: string | null
          event_name?: string
          event_type?: string | null
          event_url?: string | null
          id?: string
          leads_generated?: number | null
          maximum_cost?: number | null
          minimum_cost?: number | null
          organizer?: string | null
          participated?: boolean | null
          photos_urls?: string[] | null
          relevance_score?: number | null
          sponsorship_levels?: Json | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          discount_pct: number | null
          effective_price: number | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          plan_type: string
          services: string[]
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          discount_pct?: number | null
          effective_price?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          name: string
          plan_type: string
          services: string[]
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          discount_pct?: number | null
          effective_price?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          plan_type?: string
          services?: string[]
        }
        Relationships: []
      }
      territories: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          neighborhoods: string[] | null
          priority: number | null
          radius_miles: number | null
          target_hangers_per_month: number | null
          target_jobs_per_month: number | null
          target_signs_per_month: number | null
          updated_at: string | null
          zip_codes: string[] | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          neighborhoods?: string[] | null
          priority?: number | null
          radius_miles?: number | null
          target_hangers_per_month?: number | null
          target_jobs_per_month?: number | null
          target_signs_per_month?: number | null
          updated_at?: string | null
          zip_codes?: string[] | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          neighborhoods?: string[] | null
          priority?: number | null
          radius_miles?: number | null
          target_hangers_per_month?: number | null
          target_jobs_per_month?: number | null
          target_signs_per_month?: number | null
          updated_at?: string | null
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      unlinked_mentions: {
        Row: {
          anchor_text_suggested: string | null
          contact_email: string | null
          contact_form_url: string | null
          contact_name: string | null
          created_at: string | null
          discovered_at: string | null
          discovery_method: string | null
          domain_authority: number | null
          follow_up_count: number | null
          id: string
          last_follow_up_at: string | null
          link_added: boolean | null
          link_added_at: string | null
          link_type: string | null
          mention_context: string | null
          mention_domain: string
          mention_text: string | null
          mention_url: string
          outreach_email_text: string | null
          outreach_sent_at: string | null
          outreach_status: string | null
          page_authority: number | null
          page_title: string | null
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          anchor_text_suggested?: string | null
          contact_email?: string | null
          contact_form_url?: string | null
          contact_name?: string | null
          created_at?: string | null
          discovered_at?: string | null
          discovery_method?: string | null
          domain_authority?: number | null
          follow_up_count?: number | null
          id?: string
          last_follow_up_at?: string | null
          link_added?: boolean | null
          link_added_at?: string | null
          link_type?: string | null
          mention_context?: string | null
          mention_domain: string
          mention_text?: string | null
          mention_url: string
          outreach_email_text?: string | null
          outreach_sent_at?: string | null
          outreach_status?: string | null
          page_authority?: number | null
          page_title?: string | null
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          anchor_text_suggested?: string | null
          contact_email?: string | null
          contact_form_url?: string | null
          contact_name?: string | null
          created_at?: string | null
          discovered_at?: string | null
          discovery_method?: string | null
          domain_authority?: number | null
          follow_up_count?: number | null
          id?: string
          last_follow_up_at?: string | null
          link_added?: boolean | null
          link_added_at?: string | null
          link_type?: string | null
          mention_context?: string | null
          mention_domain?: string
          mention_text?: string | null
          mention_url?: string
          outreach_email_text?: string | null
          outreach_sent_at?: string | null
          outreach_status?: string | null
          page_authority?: number | null
          page_title?: string | null
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vendor_list_applications: {
        Row: {
          all_requirements_met: boolean | null
          application_opened_date: string | null
          application_round: number | null
          approved_services: string[] | null
          contract_expiry_date: string | null
          contract_start_date: string | null
          created_at: string | null
          deadline_date: string | null
          decision: string | null
          decision_expected_date: string | null
          decision_received_at: string | null
          documents_notes: string | null
          documents_submitted: string[] | null
          id: string
          jobs_won_from_list: number | null
          list_name: string
          notes: string | null
          org_id: string
          portal_name: string | null
          portal_url: string | null
          rejection_reason: string | null
          renewal_reminder_sent: boolean | null
          renewal_reminder_sent_at: string | null
          requirements_checklist: Json | null
          revenue_from_list: number | null
          submitted_at: string | null
          updated_at: string | null
          vendor_number: string | null
        }
        Insert: {
          all_requirements_met?: boolean | null
          application_opened_date?: string | null
          application_round?: number | null
          approved_services?: string[] | null
          contract_expiry_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          deadline_date?: string | null
          decision?: string | null
          decision_expected_date?: string | null
          decision_received_at?: string | null
          documents_notes?: string | null
          documents_submitted?: string[] | null
          id?: string
          jobs_won_from_list?: number | null
          list_name: string
          notes?: string | null
          org_id: string
          portal_name?: string | null
          portal_url?: string | null
          rejection_reason?: string | null
          renewal_reminder_sent?: boolean | null
          renewal_reminder_sent_at?: string | null
          requirements_checklist?: Json | null
          revenue_from_list?: number | null
          submitted_at?: string | null
          updated_at?: string | null
          vendor_number?: string | null
        }
        Update: {
          all_requirements_met?: boolean | null
          application_opened_date?: string | null
          application_round?: number | null
          approved_services?: string[] | null
          contract_expiry_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          deadline_date?: string | null
          decision?: string | null
          decision_expected_date?: string | null
          decision_received_at?: string | null
          documents_notes?: string | null
          documents_submitted?: string[] | null
          id?: string
          jobs_won_from_list?: number | null
          list_name?: string
          notes?: string | null
          org_id?: string
          portal_name?: string | null
          portal_url?: string | null
          rejection_reason?: string | null
          renewal_reminder_sent?: boolean | null
          renewal_reminder_sent_at?: string | null
          requirements_checklist?: Json | null
          revenue_from_list?: number | null
          submitted_at?: string | null
          updated_at?: string | null
          vendor_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_list_applications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_followup_queue"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "vendor_list_applications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_list_applications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "vendor_list_renewal_alerts"
            referencedColumns: ["org_id"]
          },
        ]
      }
      viral_hooks: {
        Row: {
          avg_engagement: number | null
          best_performing_post_id: string | null
          created_at: string | null
          hook_category: string
          hook_template: string
          id: string
          is_active: boolean | null
          platforms: string[] | null
          service_types: string[] | null
          source: string | null
          times_used: number | null
        }
        Insert: {
          avg_engagement?: number | null
          best_performing_post_id?: string | null
          created_at?: string | null
          hook_category: string
          hook_template: string
          id?: string
          is_active?: boolean | null
          platforms?: string[] | null
          service_types?: string[] | null
          source?: string | null
          times_used?: number | null
        }
        Update: {
          avg_engagement?: number | null
          best_performing_post_id?: string | null
          created_at?: string | null
          hook_category?: string
          hook_template?: string
          id?: string
          is_active?: boolean | null
          platforms?: string[] | null
          service_types?: string[] | null
          source?: string | null
          times_used?: number | null
        }
        Relationships: []
      }
      weather_alerts_sent: {
        Row: {
          alert_type: string
          contact_count: number | null
          created_at: string | null
          id: string
          list_id: number | null
          sent_at: string | null
          weather_data: Json | null
        }
        Insert: {
          alert_type: string
          contact_count?: number | null
          created_at?: string | null
          id?: string
          list_id?: number | null
          sent_at?: string | null
          weather_data?: Json | null
        }
        Update: {
          alert_type?: string
          contact_count?: number | null
          created_at?: string | null
          id?: string
          list_id?: number | null
          sent_at?: string | null
          weather_data?: Json | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          idempotency_key: string | null
          payload: Json | null
          processing_status: string | null
          routed_to: string | null
          source: string
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json | null
          processing_status?: string | null
          routed_to?: string | null
          source: string
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json | null
          processing_status?: string | null
          routed_to?: string | null
          source?: string
        }
        Relationships: []
      }
      yard_sign_deployments: {
        Row: {
          collected_at: string | null
          collected_by: string | null
          collection_status: string | null
          created_at: string | null
          customer_address: string | null
          customer_city: string | null
          customer_name: string | null
          customer_zip: string | null
          deployed_address: string | null
          deployed_at: string | null
          deployed_by: string | null
          deployed_lat: number
          deployed_lng: number
          deployment_photo_url: string | null
          id: string
          job_completed_at: string | null
          job_id: string
          job_total: number | null
          leads_attributed: number | null
          revenue_attributed: number | null
          service_type: string | null
          sign_code: string | null
          sign_inventory_id: string | null
          target_collection_date: string | null
          target_duration_days: number | null
          territory_id: string | null
          updated_at: string | null
        }
        Insert: {
          collected_at?: string | null
          collected_by?: string | null
          collection_status?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_name?: string | null
          customer_zip?: string | null
          deployed_address?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          deployed_lat: number
          deployed_lng: number
          deployment_photo_url?: string | null
          id?: string
          job_completed_at?: string | null
          job_id: string
          job_total?: number | null
          leads_attributed?: number | null
          revenue_attributed?: number | null
          service_type?: string | null
          sign_code?: string | null
          sign_inventory_id?: string | null
          target_collection_date?: string | null
          target_duration_days?: number | null
          territory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          collected_at?: string | null
          collected_by?: string | null
          collection_status?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_name?: string | null
          customer_zip?: string | null
          deployed_address?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          deployed_lat?: number
          deployed_lng?: number
          deployment_photo_url?: string | null
          id?: string
          job_completed_at?: string | null
          job_id?: string
          job_total?: number | null
          leads_attributed?: number | null
          revenue_attributed?: number | null
          service_type?: string | null
          sign_code?: string | null
          sign_inventory_id?: string | null
          target_collection_date?: string | null
          target_duration_days?: number | null
          territory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yard_sign_deployments_sign_inventory_id_fkey"
            columns: ["sign_inventory_id"]
            isOneToOne: false
            referencedRelation: "yard_sign_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yard_sign_deployments_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      yard_sign_inventory: {
        Row: {
          condition: string | null
          created_at: string | null
          current_deployment_id: string | null
          has_stake: boolean | null
          id: string
          leads_attributed: number | null
          notes: string | null
          purchase_cost: number | null
          purchase_date: string | null
          sign_code: string
          sign_type: string | null
          status: string | null
          total_days_deployed: number | null
          total_deployments: number | null
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          current_deployment_id?: string | null
          has_stake?: boolean | null
          id?: string
          leads_attributed?: number | null
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          sign_code: string
          sign_type?: string | null
          status?: string | null
          total_days_deployed?: number | null
          total_deployments?: number | null
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          current_deployment_id?: string | null
          has_stake?: boolean | null
          id?: string
          leads_attributed?: number | null
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          sign_code?: string
          sign_type?: string | null
          status?: string | null
          total_days_deployed?: number | null
          total_deployments?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ab_test_performance: {
        Row: {
          conversion_rate: number | null
          conversions: number | null
          impressions: number | null
          test_duration: string | null
          test_id: string | null
          test_name: string | null
          test_started_at: string | null
          test_status: string | null
          traffic_percentage: number | null
          variant_id: string | null
          variant_name: string | null
        }
        Relationships: []
      }
      active_ad_campaigns: {
        Row: {
          active_creatives: number | null
          auto_generated: boolean | null
          budget: number | null
          campaign_name: string | null
          campaign_type: string | null
          created_at: string | null
          daily_budget: number | null
          end_date: string | null
          external_campaign_id: string | null
          id: string | null
          objective: string | null
          platform: string | null
          roas: number | null
          service_type: string | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          target_zip_codes: string[] | null
          template_id: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          total_revenue: number | null
          total_spend: number | null
          updated_at: string | null
          winning_creatives: number | null
        }
        Insert: {
          active_creatives?: never
          auto_generated?: boolean | null
          budget?: number | null
          campaign_name?: string | null
          campaign_type?: string | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          external_campaign_id?: string | null
          id?: string | null
          objective?: string | null
          platform?: string | null
          roas?: number | null
          service_type?: string | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          target_zip_codes?: string[] | null
          template_id?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_revenue?: number | null
          total_spend?: number | null
          updated_at?: string | null
          winning_creatives?: never
        }
        Update: {
          active_creatives?: never
          auto_generated?: boolean | null
          budget?: number | null
          campaign_name?: string | null
          campaign_type?: string | null
          created_at?: string | null
          daily_budget?: number | null
          end_date?: string | null
          external_campaign_id?: string | null
          id?: string | null
          objective?: string | null
          platform?: string | null
          roas?: number | null
          service_type?: string | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          target_zip_codes?: string[] | null
          template_id?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          total_revenue?: number | null
          total_spend?: number | null
          updated_at?: string | null
          winning_creatives?: never
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sequences: {
        Row: {
          contact_email: string | null
          current_step: number | null
          emails_sent: number | null
          enrolled_at: string | null
          last_email_sent: string | null
          next_send_at: string | null
          sequence_name: string | null
        }
        Relationships: []
      }
      ai_visibility_summary: {
        Row: {
          ai_platform: string | null
          checks_last_7d: number | null
          last_checked: string | null
          mention_rate_pct: number | null
          mentions_last_7d: number | null
          times_mentioned: number | null
          times_recommended: number | null
          total_checks: number | null
        }
        Relationships: []
      }
      ai_voice_dashboard: {
        Row: {
          appointments_30d: number | null
          avg_booked_value: number | null
          avg_quote_value: number | null
          booked_revenue_30d: number | null
          conversion_rate_pct: number | null
          quotes_30d: number | null
          quotes_7d: number | null
          total_appointments: number | null
          total_booked_revenue: number | null
          total_quotes: number | null
          unique_callers: number | null
          unique_callers_30d: number | null
        }
        Relationships: []
      }
      ai_voice_quotes_by_service: {
        Row: {
          avg_quote_value: number | null
          booked: number | null
          booked_revenue: number | null
          conversion_rate_pct: number | null
          primary_service: string | null
          total_quotes: number | null
        }
        Relationships: []
      }
      asset_performance: {
        Row: {
          asset_type: string | null
          backlinks_earned: number | null
          cost_per_link: number | null
          id: string | null
          leads_generated: number | null
          page_views: number | null
          promotion_count: number | null
          promotion_spend: number | null
          published_at: string | null
          referring_domains: number | null
          status: string | null
          title: string | null
          total_cost: number | null
        }
        Relationships: []
      }
      backlink_dashboard: {
        Row: {
          at_risk: number | null
          avg_domain_authority: number | null
          citation_links: number | null
          dofollow_count: number | null
          guest_post_links: number | null
          haro_links: number | null
          high_da_links: number | null
          lost_this_week: number | null
          needs_check: number | null
          new_this_month: number | null
          new_this_week: number | null
          nofollow_count: number | null
          organic_links: number | null
          outreach_links: number | null
          pr_links: number | null
          referring_domains: number | null
          total_live_backlinks: number | null
        }
        Relationships: []
      }
      brevo_segment_candidates: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          health_tier: string | null
          id: string | null
          last_job_at: string | null
          last_name: string | null
          lead_score: number | null
          lifetime_value: number | null
          seg_aeration: boolean | null
          seg_at_risk: boolean | null
          seg_dormant: boolean | null
          seg_fertilization: boolean | null
          seg_gutter_cleaning: boolean | null
          seg_high_value: boolean | null
          seg_hot_lead: boolean | null
          seg_landscape_enhancements: boolean | null
          seg_lawn_mowing: boolean | null
          seg_madison_proper: boolean | null
          seg_madison_suburbs: boolean | null
          seg_new_unconverted: boolean | null
          seg_recently_active: boolean | null
          seg_repeat_customer: boolean | null
          seg_seasonal_cleanup: boolean | null
          seg_snow_removal: boolean | null
          seg_vip: boolean | null
          services: string[] | null
          total_jobs: number | null
        }
        Relationships: []
      }
      citation_dashboard: {
        Row: {
          awaiting_verification: number | null
          citations_with_backlinks: number | null
          consistent_citations: number | null
          dofollow_backlinks: number | null
          inconsistent_citations: number | null
          live_citations: number | null
          needs_audit: number | null
          pending_submissions: number | null
        }
        Relationships: []
      }
      clean_score_leaderboard: {
        Row: {
          city: string | null
          clean_score: number | null
          last_calculated_at: string | null
          neighborhood_name: string | null
          properties_serviced: number | null
          rank: number | null
          service_penetration: number | null
          trend: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          clean_score?: number | null
          last_calculated_at?: string | null
          neighborhood_name?: string | null
          properties_serviced?: number | null
          rank?: number | null
          service_penetration?: number | null
          trend?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          clean_score?: number | null
          last_calculated_at?: string | null
          neighborhood_name?: string | null
          properties_serviced?: number | null
          rank?: number | null
          service_penetration?: number | null
          trend?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      collections_dashboard: {
        Row: {
          in_collections: number | null
          in_collections_amount: number | null
          overdue_amount: number | null
          overdue_count: number | null
          paid_30d: number | null
          revenue_collected_30d: number | null
        }
        Relationships: []
      }
      commercial_dashboard: {
        Row: {
          active_accounts: number | null
          overdue_services: number | null
          proposal_accounts: number | null
          prospect_accounts: number | null
          revenue_by_account: Json | null
          services_due_this_month: number | null
          total_accounts: number | null
          total_annual_contract_value: number | null
          total_lifetime_revenue: number | null
          total_monthly_contract_value: number | null
        }
        Relationships: []
      }
      competitor_opportunities: {
        Row: {
          competitor_name: string | null
          discovered_at: string | null
          domain_authority: number | null
          opportunity_notes: string | null
          opportunity_type: string | null
          priority: string | null
          source_domain: string | null
          source_url: string | null
        }
        Relationships: []
      }
      contact_email_frequency: {
        Row: {
          can_receive_email: boolean | null
          contact_email: string | null
          emails_last_30_days: number | null
          emails_last_7_days: number | null
          last_email_sent: string | null
        }
        Relationships: []
      }
      content_ab_test_results: {
        Row: {
          confidence_level: number | null
          end_date: string | null
          platform: string | null
          start_date: string | null
          status: string | null
          test_id: string | null
          test_name: string | null
          variant_a_caption: string | null
          variant_a_engagement: number | null
          variant_a_impressions: number | null
          variant_b_caption: string | null
          variant_b_engagement: number | null
          variant_b_impressions: number | null
          winner: string | null
          winning_insights: string | null
        }
        Relationships: []
      }
      content_calendar_this_month: {
        Row: {
          content_type: string | null
          id: string | null
          is_seasonal: boolean | null
          link_building_angle: string | null
          planned_date: string | null
          season: string | null
          status: string | null
          target_keywords: string[] | null
          title: string | null
        }
        Insert: {
          content_type?: string | null
          id?: string | null
          is_seasonal?: boolean | null
          link_building_angle?: string | null
          planned_date?: string | null
          season?: string | null
          status?: string | null
          target_keywords?: string[] | null
          title?: string | null
        }
        Update: {
          content_type?: string | null
          id?: string | null
          is_seasonal?: boolean | null
          link_building_angle?: string | null
          planned_date?: string | null
          season?: string | null
          status?: string | null
          target_keywords?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      content_idea_pipeline: {
        Row: {
          avg_virality: number | null
          count: number | null
          high_potential: number | null
          low_potential: number | null
          medium_potential: number | null
          status: string | null
        }
        Relationships: []
      }
      conversion_funnel_view: {
        Row: {
          count: number | null
          stage: string | null
          stage_order: number | null
        }
        Relationships: []
      }
      customer_health_dashboard: {
        Row: {
          at_risk: number | null
          at_risk_revenue: number | null
          avg_health_score: number | null
          champions: number | null
          churned: number | null
          healthy: number | null
          loyal: number | null
          winback_eligible_unsent: number | null
        }
        Relationships: []
      }
      dashboard_metrics_view: {
        Row: {
          avg_response_time_seconds: number | null
          cold_leads: number | null
          conversion_rate: number | null
          hot_leads: number | null
          leads_last_month: number | null
          leads_last_week: number | null
          leads_this_month: number | null
          leads_this_week: number | null
          pipeline_value: number | null
          warm_leads: number | null
        }
        Relationships: []
      }
      email_performance: {
        Row: {
          click_rate: number | null
          conversion_rate: number | null
          email_type: string | null
          open_rate: number | null
          sequence_step: number | null
          total_clicked: number | null
          total_converted: number | null
          total_opened: number | null
          total_sent: number | null
          workflow_name: string | null
        }
        Relationships: []
      }
      estimate_pipeline: {
        Row: {
          approved_count: number | null
          approved_value: number | null
          conversion_rate: number | null
          sent_count: number | null
          sent_value: number | null
        }
        Relationships: []
      }
      ga4_weekly_summary: {
        Row: {
          avg_bounce_rate: number | null
          avg_session_duration: number | null
          total_conversions: number | null
          total_new_users: number | null
          total_page_views: number | null
          total_sessions: number | null
          total_users: number | null
          week_start: string | null
        }
        Relationships: []
      }
      gift_certificate_dashboard: {
        Row: {
          active_count: number | null
          expired_count: number | null
          fully_used_count: number | null
          partially_used_count: number | null
          refunded_count: number | null
          total_outstanding_balance: number | null
          total_redeemed: number | null
          total_revenue: number | null
          total_sold: number | null
        }
        Relationships: []
      }
      gsc_keyword_trends: {
        Row: {
          avg_position: number | null
          click_change: number | null
          clicks: number | null
          ctr: number | null
          impression_change: number | null
          impressions: number | null
          position_change: number | null
          query: string | null
          week_start: string | null
        }
        Relationships: []
      }
      guest_post_pipeline: {
        Row: {
          accepted: number | null
          avg_target_da: number | null
          awaiting_response: number | null
          backlinks_won: number | null
          in_progress: number | null
          new_prospects: number | null
          pitches_ready: number | null
          published: number | null
          researching: number | null
          submitted: number | null
        }
        Relationships: []
      }
      haro_pipeline: {
        Row: {
          avg_relevance_score: number | null
          backlinks_won: number | null
          drafts_in_progress: number | null
          evaluating: number | null
          new_queries: number | null
          pending_review: number | null
          pitches_sent: number | null
          published: number | null
        }
        Relationships: []
      }
      high_value_prospects: {
        Row: {
          backlink_policy: string | null
          domain_authority: number | null
          id: string | null
          outreach_status: string | null
          relevance_category: string | null
          site_name: string | null
          site_url: string | null
          value_tier: string | null
        }
        Relationships: []
      }
      institutional_followup_queue: {
        Row: {
          contact_email: string | null
          contact_first_name: string | null
          contact_id: string | null
          contact_last_name: string | null
          contact_outreach_status: string | null
          contact_role: string | null
          contact_title: string | null
          current_sequence_step: number | null
          estimated_annual_value: number | null
          next_followup_at: string | null
          org_id: string | null
          org_name: string | null
          org_type: string | null
          pipeline_stage: string | null
          priority: string | null
          sector: string | null
          services_needed: string[] | null
          total_contacts_sent: number | null
        }
        Relationships: []
      }
      institutional_pipeline_dashboard: {
        Row: {
          active_vendor_value: number | null
          active_vendors: number | null
          approved_applications: number | null
          in_application: number | null
          in_discovery: number | null
          in_first_contact: number | null
          in_relationship: number | null
          in_research: number | null
          org_type: string | null
          renewals_due_60d: number | null
          sector: string | null
          total_orgs: number | null
          total_pipeline_value: number | null
        }
        Relationships: []
      }
      institutional_revenue_summary: {
        Row: {
          active_annual_value: number | null
          active_vendors: number | null
          approved_vendor_lists: number | null
          open_rfps: number | null
          total_orgs_tracked: number | null
          total_pipeline_value: number | null
          total_revenue_from_vendor_lists: number | null
        }
        Relationships: []
      }
      keyword_heatmap_data: {
        Row: {
          date: string | null
          keyword: string | null
          local_pack: boolean | null
          position_change: number | null
          position_tier: string | null
          previous_position: number | null
          rank_position: number | null
          search_engine: string | null
        }
        Insert: {
          date?: string | null
          keyword?: string | null
          local_pack?: boolean | null
          position_change?: never
          position_tier?: never
          previous_position?: number | null
          rank_position?: number | null
          search_engine?: string | null
        }
        Update: {
          date?: string | null
          keyword?: string | null
          local_pack?: boolean | null
          position_change?: never
          position_tier?: never
          previous_position?: number | null
          rank_position?: number | null
          search_engine?: string | null
        }
        Relationships: []
      }
      keyword_ranking_trends: {
        Row: {
          current_position: number | null
          device: string | null
          has_snippet: boolean | null
          in_local_pack: boolean | null
          keyword: string | null
          position_change: number | null
          previous_position: number | null
          search_engine: string | null
          trend: string | null
        }
        Relationships: []
      }
      lead_score_accuracy: {
        Row: {
          avg_score: number | null
          booked: number | null
          booking_rate: number | null
          score_tier: string | null
          total_leads: number | null
        }
        Relationships: []
      }
      lead_volume_weekly_view: {
        Row: {
          lead_count: number | null
          week_start: string | null
        }
        Relationships: []
      }
      leads_by_source_view: {
        Row: {
          count: number | null
          percentage: number | null
          source: string | null
        }
        Relationships: []
      }
      linkedin_pipeline: {
        Row: {
          connected: number | null
          connections_pending: number | null
          customers_converted: number | null
          messaged: number | null
          new_prospects: number | null
          partners_converted: number | null
          responded: number | null
        }
        Relationships: []
      }
      linkedin_pipeline_summary: {
        Row: {
          connected: number | null
          connection_sent: number | null
          customers_converted: number | null
          meetings_booked: number | null
          messaged: number | null
          new_prospects: number | null
          partners_converted: number | null
          responded: number | null
          total_prospects: number | null
        }
        Relationships: []
      }
      loyalty_leaderboard: {
        Row: {
          account_id: string | null
          city: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          lead_id: string | null
          lifetime_points_earned: number | null
          lifetime_points_redeemed: number | null
          member_since: string | null
          phone: string | null
          points_balance: number | null
          tier: string | null
          tier_updated_at: string | null
          total_earn_transactions: number | null
          total_redemptions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_program_summary: {
        Row: {
          bronze_count: number | null
          gold_count: number | null
          platinum_count: number | null
          redemptions_last_30d: number | null
          silver_count: number | null
          total_accounts: number | null
          total_points_ever_earned: number | null
          total_points_ever_redeemed: number | null
          total_points_outstanding: number | null
          transactions_last_30d: number | null
        }
        Relationships: []
      }
      marketing_roi_by_channel: {
        Row: {
          channel: string | null
          overall_roi: number | null
          total_campaigns: number | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          total_revenue: number | null
          total_spend: number | null
        }
        Relationships: []
      }
      media_pending_approval: {
        Row: {
          ai_description: string | null
          ai_quality_score: number | null
          ai_tags: string[] | null
          approval_status: string | null
          approved_at: string | null
          before_after_pair_id: string | null
          city: string | null
          created_at: string | null
          distributed_to_ads: boolean | null
          distributed_to_email: boolean | null
          distributed_to_print: boolean | null
          distributed_to_social: boolean | null
          id: string | null
          is_before_after: boolean | null
          job_id: string | null
          lat: number | null
          lead_id: string | null
          lng: number | null
          location_address: string | null
          performance_score: number | null
          photo_type: string | null
          photo_url: string | null
          property_type: string | null
          rejection_reason: string | null
          service_type: string | null
          storage_path: string | null
          thumbnail_url: string | null
          times_used: number | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          updated_at: string | null
          uploaded_by: string | null
          zip: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "brevo_segment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "needs_attention_view"
            referencedColumns: ["id"]
          },
        ]
      }
      media_wins_this_month: {
        Row: {
          backlink_obtained: boolean | null
          backlink_type: string | null
          outlet_name: string | null
          published_at: string | null
          published_url: string | null
          query_title: string | null
          source: string | null
        }
        Insert: {
          backlink_obtained?: boolean | null
          backlink_type?: string | null
          outlet_name?: string | null
          published_at?: string | null
          published_url?: string | null
          query_title?: string | null
          source?: string | null
        }
        Update: {
          backlink_obtained?: boolean | null
          backlink_type?: string | null
          outlet_name?: string | null
          published_at?: string | null
          published_url?: string | null
          query_title?: string | null
          source?: string | null
        }
        Relationships: []
      }
      monthly_revenue: {
        Row: {
          jobs: number | null
          month: string | null
          revenue: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
      needs_attention_view: {
        Row: {
          attention_reason: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          lead_score: number | null
          phone: string | null
          priority_order: number | null
          source: string | null
        }
        Insert: {
          attention_reason?: never
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          lead_score?: number | null
          phone?: string | null
          priority_order?: never
          source?: string | null
        }
        Update: {
          attention_reason?: never
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          lead_score?: number | null
          phone?: string | null
          priority_order?: never
          source?: string | null
        }
        Relationships: []
      }
      neighbor_postcard_metrics: {
        Row: {
          approved_count: number | null
          cost_30d_dollars: number | null
          jobs_booked_30d: number | null
          pending_count: number | null
          postcards_sent_30d: number | null
          qr_conversion_rate_90d: number | null
          qr_scans_30d: number | null
          redemptions_30d: number | null
          revenue_30d: number | null
          sent_count: number | null
          skipped_count: number | null
        }
        Relationships: []
      }
      nps_by_service: {
        Row: {
          avg_score: number | null
          detractors: number | null
          nps_score: number | null
          passives: number | null
          promoters: number | null
          service_type: string | null
          total_responses: number | null
        }
        Relationships: []
      }
      nps_dashboard: {
        Row: {
          avg_score: number | null
          detractors: number | null
          nps_score: number | null
          passives: number | null
          pending: number | null
          promoters: number | null
          responses_30d: number | null
          total_responses: number | null
        }
        Relationships: []
      }
      partner_leaderboard: {
        Row: {
          commissions_owed: number | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          id: string | null
          last_referral_at: string | null
          partner_type: string | null
          partnership_tier: string | null
          rank: number | null
          status: string | null
          total_commissions_earned: number | null
          total_commissions_paid: number | null
          total_jobs_booked: number | null
          total_referrals: number | null
          total_revenue_generated: number | null
        }
        Relationships: []
      }
      partner_metrics: {
        Row: {
          active_partners: number | null
          contacted: number | null
          jobs_booked_30d: number | null
          outreach_7d: number | null
          pending_commissions: number | null
          prospects: number | null
          referrals_30d: number | null
          revenue_30d: number | null
          total_commissions_paid: number | null
        }
        Relationships: []
      }
      pending_citation_queue: {
        Row: {
          directory_name: string | null
          directory_url: string | null
          priority_tier: number | null
          queue_id: string | null
          queue_position: number | null
          queued_for: string | null
          submission_data: Json | null
          submission_instructions: string | null
          submission_url: string | null
        }
        Relationships: []
      }
      pricing_optimization_dashboard: {
        Row: {
          acceptance_rate: number | null
          accepted: number | null
          avg_accepted_price: number | null
          avg_quoted_price: number | null
          avg_rejected_price: number | null
          house_size: string | null
          rejected: number | null
          season: string | null
          service_type: string | null
          total_quotes: number | null
        }
        Relationships: []
      }
      pricing_rate_card: {
        Row: {
          category: string | null
          hourly_rate: number | null
          includes: string[] | null
          minimum_one_time: number | null
          minimum_recurring: number | null
          per_unit_label: string | null
          per_unit_price: number | null
          price: number | null
          price_max: number | null
          price_type: string | null
          pricing_model: string | null
          season_end_month: number | null
          season_start_month: number | null
          seasonal_only: boolean | null
          service_name: string | null
          service_slug: string | null
          size_key: string | null
          size_label: string | null
          size_system: string | null
          tier: string | null
        }
        Relationships: []
      }
      revenue_by_service: {
        Row: {
          avg_job_value: number | null
          service_type: string | null
          total_jobs: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      revenue_by_source: {
        Row: {
          avg_job_value: number | null
          customers: number | null
          lead_source: string | null
          total_jobs: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      revenue_overview: {
        Row: {
          avg_invoice_30d: number | null
          paid_invoices_30d: number | null
          revenue_30d: number | null
          revenue_7d: number | null
          revenue_ytd: number | null
        }
        Relationships: []
      }
      review_metrics_view: {
        Row: {
          avg_google_rating: number | null
          avg_rating_30d: number | null
          avg_rating_prev_30d: number | null
          conversion_rate_90d: number | null
          five_star_count: number | null
          requests_last_30_days: number | null
          reviews_last_30_days: number | null
          reviews_last_month: number | null
          reviews_this_month: number | null
          total_google_reviews: number | null
        }
        Relationships: []
      }
      review_request_eligibility: {
        Row: {
          customer_email: string | null
          eligible_for_request: boolean | null
          last_request_at: string | null
          reviews_received: number | null
          total_requests_sent: number | null
        }
        Relationships: []
      }
      rfp_active_opportunities: {
        Row: {
          bid_status: string | null
          days_to_deadline: number | null
          estimated_value: number | null
          id: string | null
          org_id: string | null
          org_name: string | null
          relevance_score: number | null
          rfp_number: string | null
          rfp_title: string | null
          services_requested: string[] | null
          source_portal: string | null
          source_url: string | null
          submission_deadline: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfp_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_followup_queue"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "rfp_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "institutional_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfp_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "vendor_list_renewal_alerts"
            referencedColumns: ["org_id"]
          },
        ]
      }
      send_time_distribution: {
        Row: {
          hour: number | null
          hour_label: string | null
          lead_count: number | null
          pct_of_total: number | null
        }
        Relationships: []
      }
      seo_dashboard_overview: {
        Row: {
          active_ab_tests: number | null
          ai_checks_total: number | null
          ai_mentions_count: number | null
          completed_tasks: number | null
          gbp_categories: Json | null
          gbp_previous_score: number | null
          gbp_score: number | null
          ideas_pending: number | null
          ideas_scripted: number | null
          intel_updates_7d: number | null
          local_pack_keywords: number | null
          overdue_tasks: number | null
          pending_tasks: number | null
          top3_keywords: number | null
          tracked_keywords: number | null
        }
        Relationships: []
      }
      seo_page_dashboard: {
        Row: {
          drafts: number | null
          published: number | null
          service_type: string | null
          total_leads: number | null
          total_pages: number | null
          total_views: number | null
        }
        Relationships: []
      }
      seo_performance_summary: {
        Row: {
          location_pages_draft: number | null
          location_pages_published: number | null
          total_seo_leads: number | null
          total_seo_page_views: number | null
        }
        Relationships: []
      }
      seo_task_summary: {
        Row: {
          category: string | null
          highest_priority: number | null
          oldest_task: string | null
          overdue_count: number | null
          status: string | null
          task_count: number | null
        }
        Relationships: []
      }
      source_attribution: {
        Row: {
          avg_lead_score: number | null
          avg_response_min: number | null
          booking_rate: number | null
          source: string | null
          total_booked: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      unified_business_health: {
        Row: {
          active_gift_certs: number | null
          active_subscriptions: number | null
          at_risk_customers: number | null
          avg_health_score: number | null
          avg_rating: number | null
          bookings_30d: number | null
          champion_customers: number | null
          churning_customers: number | null
          leads_30d: number | null
          leads_7d: number | null
          reviews_30d: number | null
          seo_pages_published: number | null
          total_lifetime_value: number | null
          total_reviews: number | null
        }
        Relationships: []
      }
      urgent_opportunities: {
        Row: {
          has_draft: boolean | null
          hours_until_deadline: number | null
          id: string | null
          journalist_name: string | null
          outlet_name: string | null
          query_deadline: string | null
          query_title: string | null
          relevance_score: number | null
          response_status: string | null
          source: string | null
        }
        Insert: {
          has_draft?: never
          hours_until_deadline?: never
          id?: string | null
          journalist_name?: string | null
          outlet_name?: string | null
          query_deadline?: string | null
          query_title?: string | null
          relevance_score?: number | null
          response_status?: string | null
          source?: string | null
        }
        Update: {
          has_draft?: never
          hours_until_deadline?: never
          id?: string | null
          journalist_name?: string | null
          outlet_name?: string | null
          query_deadline?: string | null
          query_title?: string | null
          relevance_score?: number | null
          response_status?: string | null
          source?: string | null
        }
        Relationships: []
      }
      vendor_list_renewal_alerts: {
        Row: {
          application_id: string | null
          contract_expiry_date: string | null
          days_until_expiry: number | null
          jobs_won_from_list: number | null
          list_name: string | null
          org_id: string | null
          org_name: string | null
          org_type: string | null
          priority: string | null
          procurement_contact_email: string | null
          renewal_reminder_sent: boolean | null
          revenue_from_list: number | null
          vendor_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _dashboard_safe_count: { Args: { p_sql: string }; Returns: number }
      _dashboard_safe_numeric: { Args: { p_sql: string }; Returns: number }
      advance_institutional_pipeline_stage: {
        Args: { p_new_stage: string; p_notes?: string; p_org_id: string }
        Returns: boolean
      }
      approve_media_asset: { Args: { p_asset_id: string }; Returns: undefined }
      attribute_invoice_revenue: {
        Args: { p_invoice_id: string }
        Returns: string
      }
      calculate_ai_quote: {
        Args: {
          p_package_tier?: string
          p_property_size?: string
          p_service_type: string
          p_stories?: number
        }
        Returns: Json
      }
      calculate_clean_scores: { Args: never; Returns: undefined }
      calculate_preferred_send_time: {
        Args: { p_lead_id: string }
        Returns: number
      }
      can_request_review: {
        Args: { p_cooldown_days?: number; p_customer_email: string }
        Returns: boolean
      }
      can_send_sms: { Args: { p_phone: string }; Returns: boolean }
      can_send_to_contact: {
        Args: {
          p_contact_email: string
          p_cooldown_days?: number
          p_email_type: string
          p_workflow_name: string
        }
        Returns: boolean
      }
      check_global_frequency: {
        Args: { p_contact_email: string; p_source_type?: string }
        Returns: boolean
      }
      check_recent_weather_alert: {
        Args: { p_alert_type: string; p_cooldown_hours?: number }
        Returns: boolean
      }
      check_vendor_list_renewals: {
        Args: never
        Returns: {
          application_id: string
          days_until_expiry: number
          list_name: string
          org_id: string
          org_name: string
          org_type: string
          procurement_contact_email: string
          revenue_from_list: number
          vendor_number: string
        }[]
      }
      create_referral_code: {
        Args: {
          p_jobber_customer_id?: string
          p_referrer_email: string
          p_referrer_name?: string
        }
        Returns: string
      }
      earn_loyalty_points: {
        Args: {
          p_description: string
          p_lead_id: string
          p_points: number
          p_ref_id?: string
          p_ref_type?: string
        }
        Returns: Json
      }
      enroll_reviewer_in_referral: {
        Args: {
          p_customer_email: string
          p_customer_name?: string
          p_review_id?: string
          p_review_request_id?: string
        }
        Returns: string
      }
      generate_campaign_from_template: {
        Args: {
          p_template_id: string
          p_trigger_data?: Json
          p_trigger_event: string
        }
        Returns: string
      }
      generate_gift_code: { Args: never; Returns: string }
      generate_partner_code: {
        Args: { p_contact_name: string; p_partner_type: string }
        Returns: string
      }
      generate_pitch_email: {
        Args: { p_opportunity_id: string }
        Returns: string
      }
      generate_promo_code: { Args: { p_city?: string }; Returns: string }
      generate_weekly_execution_report: {
        Args: { p_week_start?: string }
        Returns: string
      }
      get_balance_trends: {
        Args: { p_days?: number }
        Returns: {
          account_name: string
          balance_dollars: number
          snapshot_date: string
        }[]
      }
      get_bundle_quote: {
        Args: {
          p_bundle_slug?: string
          p_multiplier_slugs?: string[]
          p_services?: Json
        }
        Returns: Json
      }
      get_cashflow_summary: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          event_count: number
          net_cashflow: number
          total_expenses: number
          total_income: number
          total_transfers: number
        }[]
      }
      get_gbp_optimization_score: { Args: never; Returns: Json }
      get_institutional_followup_due: {
        Args: { p_limit?: number }
        Returns: {
          contact_email: string
          contact_first_name: string
          contact_id: string
          contact_last_name: string
          contact_role: string
          contact_title: string
          current_sequence_step: number
          estimated_annual_value: number
          next_followup_at: string
          org_id: string
          org_name: string
          org_type: string
          pipeline_stage: string
          priority: string
          sector: string
          services_needed: string[]
          total_contacts_sent: number
        }[]
      }
      get_institutional_pipeline_summary: { Args: never; Returns: Json }
      get_missing_seo_pages: {
        Args: never
        Returns: {
          city: string
          county: string
          population: number
          priority: string
          service_type: string
          state: string
        }[]
      }
      get_quote: {
        Args: {
          p_multiplier_slugs?: string[]
          p_price_type?: string
          p_quantity?: number
          p_service_slug: string
          p_size_key?: string
          p_tier?: string
        }
        Returns: Json
      }
      get_scriptable_ideas: {
        Args: { p_limit?: number; p_platform?: string }
        Returns: {
          content_type: string
          hook_text: string
          id: string
          idea_text: string
          media_asset_id: string
          seasonal_relevance: string
          service_type: string
          source: string
          virality_score: number
        }[]
      }
      get_seo_task_queue: {
        Args: { p_limit?: number; p_status?: string }
        Returns: Json
      }
      get_top_hooks: {
        Args: { p_category?: string; p_limit?: number; p_service_type?: string }
        Returns: {
          avg_engagement: number
          hook_category: string
          hook_template: string
          id: string
          platforms: string[]
          times_used: number
        }[]
      }
      get_total_portfolio_value: {
        Args: never
        Returns: {
          account_count: number
          business_balance: number
          investment_balance: number
          last_synced: string
          personal_balance: number
          total_balance: number
        }[]
      }
      get_upcoming_reminders: {
        Args: { p_days_ahead?: number }
        Returns: {
          action_required: string
          days_until: number
          event_id: string
          event_type: string
          scheduled_date: string
          status: string
          title: string
        }[]
      }
      get_vault_secret: { Args: { secret_name: string }; Returns: string }
      grant_sms_consent: { Args: { p_lead_id: string }; Returns: undefined }
      increment_redirect_hit: { Args: { p_source: string }; Returns: undefined }
      increment_sequence_enrolled: {
        Args: { p_sequence_id: string }
        Returns: undefined
      }
      log_email_send: {
        Args: {
          p_campaign_id?: number
          p_contact_email: string
          p_email_type: string
          p_source_type?: string
          p_template_id?: number
          p_workflow_name: string
        }
        Returns: string
      }
      log_institutional_outreach: {
        Args: {
          p_channel: string
          p_contact_id: string
          p_message_preview: string
          p_org_id: string
          p_sequence_step?: number
          p_subject: string
          p_template_name: string
        }
        Returns: string
      }
      log_review_request: {
        Args: {
          p_brevo_message_id?: string
          p_customer_email: string
          p_customer_name?: string
          p_job_completed_at?: string
          p_job_id?: string
          p_jobber_customer_id?: string
          p_request_type?: string
          p_service_type?: string
          p_template_id?: number
          p_total_services?: number
        }
        Returns: string
      }
      populate_citation_queue: {
        Args: { p_max_items?: number; p_queue_date?: string }
        Returns: number
      }
      queue_neighbor_postcard: {
        Args: {
          p_customer_email?: string
          p_customer_name?: string
          p_job_address?: string
          p_job_city?: string
          p_job_completed_at: string
          p_job_id: string
          p_job_lat?: number
          p_job_lng?: number
          p_job_state?: string
          p_job_total?: number
          p_job_zip?: string
          p_jobber_customer_id?: string
          p_promo_discount_percent?: number
          p_service_type?: string
          p_target_radius_miles?: number
        }
        Returns: string
      }
      record_backlink_check: {
        Args: {
          p_backlink_id: string
          p_found_anchor?: string
          p_found_link: boolean
          p_found_type?: string
          p_http_status?: number
          p_result: string
        }
        Returns: undefined
      }
      redeem_gift_certificate: {
        Args: { p_amount: number; p_code: string; p_job_id?: string }
        Returns: number
      }
      redeem_loyalty_points: {
        Args: { p_description: string; p_lead_id: string; p_points: number }
        Returns: Json
      }
      reject_seo_task: { Args: { p_task_id: string }; Returns: Json }
      score_customer_health: {
        Args: { p_customer_email: string }
        Returns: number
      }
      score_haro_relevance: {
        Args: { p_category?: string; p_query: string; p_title: string }
        Returns: Json
      }
      submit_nps_response: {
        Args: { p_feedback?: string; p_score: number; p_survey_id: string }
        Returns: Json
      }
      update_hook_performance: {
        Args: { p_engagement: number; p_hook_id: string; p_post_id?: string }
        Returns: undefined
      }
      upsert_lead: {
        Args: {
          p_address?: string
          p_city?: string
          p_email: string
          p_external_id?: string
          p_facebook_lead_id?: string
          p_first_name: string
          p_landing_page?: string
          p_last_name: string
          p_message?: string
          p_phone: string
          p_phone_call_duration?: number
          p_phone_call_recording_url?: string
          p_property_type?: string
          p_raw_payload?: Json
          p_services?: string[]
          p_source: string
          p_source_detail?: string
          p_state?: string
          p_utm_campaign?: string
          p_utm_content?: string
          p_utm_medium?: string
          p_utm_source?: string
          p_utm_term?: string
          p_zip_code?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
