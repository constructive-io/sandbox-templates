-- Deploy: schemas/myapp_events_private/procedures/member_record_event/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_events/table


CREATE FUNCTION myapp_events_private.member_record_event(
  IN step text,
  IN entity_id uuid,
  IN actor_id uuid DEFAULT jwt_public.current_user_id(),
  IN organization_id uuid DEFAULT NULL,
  IN entity_type text DEFAULT NULL
) RETURNS void AS $_PGFN_$
BEGIN
  INSERT INTO myapp_events_public.org_events (
    name,
    actor_id,
    entity_id,
    organization_id,
    entity_type,
    count
  )
  VALUES
    (member_record_event.step, member_record_event.actor_id, member_record_event.entity_id, member_record_event.organization_id, member_record_event.entity_type, 1);
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

