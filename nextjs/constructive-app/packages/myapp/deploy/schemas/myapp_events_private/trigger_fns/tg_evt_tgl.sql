-- Deploy: schemas/myapp_events_private/trigger_fns/tg_evt_tgl
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/procedures/record_event/procedure
-- requires: schemas/myapp_events_private/procedures/remove_event/procedure


CREATE FUNCTION myapp_events_private.tg_evt_tgl() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  is_null boolean;
  task_name text;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    task_name := (tg_argv)[1]::text;
    EXECUTE format('SELECT ($1).%s IS NULL', (tg_argv)[0]) INTO is_null USING NEW;
    IF is_null IS TRUE THEN
      PERFORM myapp_events_private.remove_event(task_name);
    ELSE
      PERFORM myapp_events_private.record_event(task_name);
    END IF;
    RETURN NEW;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

