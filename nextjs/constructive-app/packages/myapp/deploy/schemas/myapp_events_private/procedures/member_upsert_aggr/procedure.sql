-- Deploy: schemas/myapp_events_private/procedures/member_upsert_aggr/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table


CREATE FUNCTION myapp_events_private.member_upsert_aggr(
  IN user_id uuid,
  IN org_id uuid,
  IN event_name text,
  IN event_count int
) RETURNS void AS $_PGFN_$
DECLARE
  v_aggregation citext;
  v_feeds_levels boolean;
  v_period_interval interval;
BEGIN
  SELECT
    et.aggregation,
    et.feeds_levels,
    et.period_interval
  FROM myapp_events_public.org_event_types AS et
  WHERE
    et.name = event_name AND et.is_active = true INTO v_aggregation, v_feeds_levels, v_period_interval;
  IF NOT (FOUND) THEN
    SELECT
      'count',
      true,
      NULL INTO v_aggregation, v_feeds_levels, v_period_interval;
  END IF;
  IF NOT (v_feeds_levels) THEN
    RETURN;
  END IF;
  IF v_aggregation = 'none' THEN
    RETURN;
  END IF;
  IF v_aggregation = 'last_value' THEN
    INSERT INTO myapp_events_public.org_event_aggregates (
      actor_id,
      entity_id,
      name,
      count,
      period_start
    )
    VALUES
      (member_upsert_aggr.user_id, member_upsert_aggr.org_id, member_upsert_aggr.event_name, 1, CASE 
          WHEN v_period_interval IS NOT NULL THEN pg_catalog.now() 
          ELSE NULL 
        END)
    ON CONFLICT (actor_id, entity_id, name) DO UPDATE SET
    count = CASE 
      WHEN v_period_interval IS NOT NULL AND (org_event_aggregates.period_start IS NOT NULL AND (org_event_aggregates.period_start + v_period_interval) <= pg_catalog.now()) THEN 1 
      ELSE org_event_aggregates.count + 1 
    END, period_start = CASE 
      WHEN v_period_interval IS NOT NULL AND (org_event_aggregates.period_start IS NULL OR (org_event_aggregates.period_start + v_period_interval) <= pg_catalog.now()) THEN pg_catalog.now() 
      ELSE org_event_aggregates.period_start 
    END;
  ELSE
    INSERT INTO myapp_events_public.org_event_aggregates (
      actor_id,
      entity_id,
      name,
      count,
      period_start
    )
    VALUES
      (member_upsert_aggr.user_id, member_upsert_aggr.org_id, member_upsert_aggr.event_name, greatest(member_upsert_aggr.event_count, 0), CASE 
          WHEN v_period_interval IS NOT NULL THEN pg_catalog.now() 
          ELSE NULL 
        END)
    ON CONFLICT (actor_id, entity_id, name) DO UPDATE SET
    count = CASE 
      WHEN v_period_interval IS NOT NULL AND (org_event_aggregates.period_start IS NOT NULL AND (org_event_aggregates.period_start + v_period_interval) <= pg_catalog.now()) THEN EXCLUDED.count 
      ELSE org_event_aggregates.count + EXCLUDED.count 
    END, period_start = CASE 
      WHEN v_period_interval IS NOT NULL AND (org_event_aggregates.period_start IS NULL OR (org_event_aggregates.period_start + v_period_interval) <= pg_catalog.now()) THEN pg_catalog.now() 
      ELSE org_event_aggregates.period_start 
    END;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

