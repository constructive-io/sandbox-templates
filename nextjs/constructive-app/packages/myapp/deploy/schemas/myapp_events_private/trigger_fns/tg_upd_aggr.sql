-- Deploy: schemas/myapp_events_private/trigger_fns/tg_upd_aggr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/procedures/upsert_aggr/procedure


CREATE FUNCTION myapp_events_private.tg_upd_aggr() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  PERFORM myapp_events_private.upsert_aggr(NEW.actor_id, NEW.name, NEW.count);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

