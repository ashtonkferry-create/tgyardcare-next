-- Migration 060: Fix generate_weekly_execution_report RPC
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Bug: referenced non-existent column "job_id" in field_marketing_compliance
-- Fix: use COALESCE(SUM(jobs_completed), 0) instead of COUNT(DISTINCT job_id)

CREATE OR REPLACE FUNCTION generate_weekly_execution_report(
  p_week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_week_end DATE;
  v_total_jobs INTEGER;
  v_total_signs INTEGER;
  v_total_hangers INTEGER;
  v_tasks_created INTEGER;
  v_tasks_completed INTEGER;
  v_tasks_overdue INTEGER;
  v_tasks_skipped INTEGER;
  v_sign_score NUMERIC;
  v_hanger_score NUMERIC;
  v_task_score NUMERIC;
  v_execution_score NUMERIC;
  v_grade TEXT;
  v_prev_score NUMERIC;
  v_trend TEXT;
BEGIN
  v_week_end := p_week_start + INTERVAL '6 days';

  -- Aggregate metrics for the week (FIXED: was COUNT(DISTINCT job_id), now SUM(jobs_completed))
  SELECT
    COALESCE(SUM(jobs_completed), 0),
    COALESCE(SUM(yard_signs_actual), 0),
    COALESCE(SUM(door_hangers_actual), 0)
  INTO v_total_jobs, v_total_signs, v_total_hangers
  FROM field_marketing_compliance
  WHERE compliance_date BETWEEN p_week_start AND v_week_end;

  -- Task metrics
  SELECT COUNT(*) INTO v_tasks_created
  FROM field_marketing_tasks
  WHERE DATE(created_at) BETWEEN p_week_start AND v_week_end;

  SELECT COUNT(*) INTO v_tasks_completed
  FROM field_marketing_tasks
  WHERE DATE(completed_at) BETWEEN p_week_start AND v_week_end;

  SELECT COUNT(*) INTO v_tasks_overdue
  FROM field_marketing_tasks
  WHERE status IN ('pending', 'in_progress', 'escalated')
    AND due_at < v_week_end::TIMESTAMPTZ;

  SELECT COUNT(*) INTO v_tasks_skipped
  FROM field_marketing_tasks
  WHERE DATE(skipped_at) BETWEEN p_week_start AND v_week_end;

  -- Calculate scores
  v_sign_score := CASE
    WHEN v_total_jobs > 0 THEN LEAST(100, (v_total_signs::NUMERIC / v_total_jobs) * 100)
    ELSE 100
  END;

  v_hanger_score := CASE
    WHEN v_total_jobs > 0 THEN LEAST(100, (v_total_hangers::NUMERIC / (v_total_jobs * 30)) * 100)
    ELSE 100
  END;

  v_task_score := CASE
    WHEN v_tasks_created > 0 THEN (v_tasks_completed::NUMERIC / v_tasks_created) * 100
    ELSE 100
  END;

  -- Weighted execution score
  v_execution_score := (v_sign_score * 0.35) + (v_hanger_score * 0.45) + (v_task_score * 0.20);

  -- Grade
  v_grade := CASE
    WHEN v_execution_score >= 90 THEN 'A'
    WHEN v_execution_score >= 80 THEN 'B'
    WHEN v_execution_score >= 70 THEN 'C'
    WHEN v_execution_score >= 60 THEN 'D'
    ELSE 'F'
  END;

  -- Get previous week score for trend
  SELECT execution_score INTO v_prev_score
  FROM marketing_execution_scores
  WHERE period_type = 'weekly' AND period_start = p_week_start - INTERVAL '7 days';

  -- Determine trend
  v_trend := CASE
    WHEN v_prev_score IS NULL THEN 'stable'
    WHEN v_execution_score > v_prev_score + 5 THEN 'improving'
    WHEN v_execution_score < v_prev_score - 5 THEN 'declining'
    ELSE 'stable'
  END;

  -- Upsert report
  INSERT INTO marketing_execution_scores (
    period_type,
    period_start,
    period_end,
    yard_sign_score,
    door_hanger_score,
    task_completion_score,
    total_jobs,
    total_yard_signs,
    total_door_hangers,
    total_tasks_created,
    total_tasks_completed,
    total_tasks_overdue,
    total_tasks_skipped,
    execution_score,
    grade,
    score_vs_previous,
    trend,
    calculated_at
  ) VALUES (
    'weekly',
    p_week_start,
    v_week_end,
    v_sign_score,
    v_hanger_score,
    v_task_score,
    v_total_jobs,
    v_total_signs,
    v_total_hangers,
    v_tasks_created,
    v_tasks_completed,
    v_tasks_overdue,
    v_tasks_skipped,
    v_execution_score,
    v_grade,
    v_execution_score - COALESCE(v_prev_score, v_execution_score),
    v_trend,
    NOW()
  )
  ON CONFLICT (period_type, period_start) DO UPDATE SET
    period_end = EXCLUDED.period_end,
    yard_sign_score = EXCLUDED.yard_sign_score,
    door_hanger_score = EXCLUDED.door_hanger_score,
    task_completion_score = EXCLUDED.task_completion_score,
    total_jobs = EXCLUDED.total_jobs,
    total_yard_signs = EXCLUDED.total_yard_signs,
    total_door_hangers = EXCLUDED.total_door_hangers,
    total_tasks_created = EXCLUDED.total_tasks_created,
    total_tasks_completed = EXCLUDED.total_tasks_completed,
    total_tasks_overdue = EXCLUDED.total_tasks_overdue,
    total_tasks_skipped = EXCLUDED.total_tasks_skipped,
    execution_score = EXCLUDED.execution_score,
    grade = EXCLUDED.grade,
    score_vs_previous = EXCLUDED.score_vs_previous,
    trend = EXCLUDED.trend,
    calculated_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
