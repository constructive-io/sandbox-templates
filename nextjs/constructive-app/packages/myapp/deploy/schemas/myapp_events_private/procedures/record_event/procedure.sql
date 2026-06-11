-- Deploy: schemas/myapp_events_private/procedures/record_event/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


CREATE FUNCTION myapp_events_private.record_event(
  IN step text,
  IN actor_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS void AS $_PGFN_$
BEGIN
  IF record_event.actor_id IS NOT NULL THEN
    INSERT INTO myapp_events_public.app_events (
      name,
      actor_id,
      count
    )
    VALUES
      (record_event.step, record_event.actor_id, 1);
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

