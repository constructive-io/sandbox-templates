-- Deploy: schemas/myapp_events_private/trigger_fns/member_tg_evt_tgl_bool
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/procedures/member_record_event/procedure
-- requires: schemas/myapp_events_private/procedures/member_remove_event/procedure


CREATE FUNCTION myapp_events_private.member_tg_evt_tgl_bool() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  is_true boolean;
  task_name text;
  entity_id uuid;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    task_name := (tg_argv)[2]::text;
    EXECUTE format('SELECT ($1).%s IS TRUE', (tg_argv)[0]) INTO is_true USING NEW;
    EXECUTE format('SELECT ($1).%s', (tg_argv)[1]) INTO entity_id USING NEW;
    IF is_true IS TRUE THEN
      PERFORM myapp_events_private.member_record_event(task_name, entity_id);
    ELSE
      PERFORM myapp_events_private.member_remove_event(task_name, entity_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

