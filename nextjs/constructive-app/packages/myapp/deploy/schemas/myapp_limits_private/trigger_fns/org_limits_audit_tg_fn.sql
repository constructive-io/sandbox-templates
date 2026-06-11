-- Deploy: schemas/myapp_limits_private/trigger_fns/org_limits_audit_tg_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/table


CREATE FUNCTION myapp_limits_private.org_limits_audit_tg_fn() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  INSERT INTO myapp_limits_public.org_limit_events (
    name,
    actor_id,
    event_type,
    delta,
    num_before,
    num_after,
    max_at_event
  )
  VALUES
    (NEW.name, NEW.actor_id, CASE 
        WHEN OLD IS NOT NULL AND NEW.max <> OLD.max THEN 'modify' 
        WHEN (NEW.num - (COALESCE(OLD.num, 0))) >= 0 THEN 'inc' 
        ELSE 'dec' 
      END, NEW.num - (COALESCE(OLD.num, 0)), COALESCE(OLD.num, 0), NEW.num, NEW.max);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

