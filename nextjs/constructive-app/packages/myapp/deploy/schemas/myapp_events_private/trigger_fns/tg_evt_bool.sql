-- Deploy: schemas/myapp_events_private/trigger_fns/tg_evt_bool
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/procedures/record_event/procedure


CREATE FUNCTION myapp_events_private.tg_evt_bool() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  is_true boolean;
  task_name text;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    task_name := (tg_argv)[1]::text;
    EXECUTE format('SELECT ($1).%s IS TRUE', (tg_argv)[0]) INTO is_true USING NEW;
    IF is_true IS TRUE THEN
      PERFORM myapp_events_private.record_event(task_name);
    END IF;
    RETURN NEW;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

