-- Deploy: schemas/myapp_events_private/procedures/member_remove_event/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table


CREATE FUNCTION myapp_events_private.member_remove_event(
  IN step text,
  IN entity_id uuid,
  IN actor_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM myapp_events_public.org_events AS s
  WHERE
    (s.actor_id = member_remove_event.actor_id AND s.entity_id = member_remove_event.entity_id) AND s.name = member_remove_event.step;
  DELETE FROM myapp_events_public.org_event_aggregates AS a
  WHERE
    (a.actor_id = member_remove_event.actor_id AND a.entity_id = member_remove_event.entity_id) AND a.name = member_remove_event.step;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

