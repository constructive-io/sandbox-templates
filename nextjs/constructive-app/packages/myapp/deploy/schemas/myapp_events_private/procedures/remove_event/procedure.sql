-- Deploy: schemas/myapp_events_private/procedures/remove_event/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/app_events/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


CREATE FUNCTION myapp_events_private.remove_event(
  IN step text,
  IN actor_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS void AS $_PGFN_$
BEGIN
  IF remove_event.actor_id IS NOT NULL THEN
    DELETE FROM myapp_events_public.app_events AS s
    WHERE
      s.actor_id = remove_event.actor_id AND s.name = remove_event.step;
    DELETE FROM myapp_events_public.app_event_aggregates AS a
    WHERE
      a.actor_id = remove_event.actor_id AND a.name = remove_event.step;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

