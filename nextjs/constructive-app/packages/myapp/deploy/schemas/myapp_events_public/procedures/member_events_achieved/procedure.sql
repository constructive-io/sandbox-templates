-- Deploy: schemas/myapp_events_public/procedures/member_events_achieved/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/procedures/member_events_required/procedure


CREATE FUNCTION myapp_events_public.member_events_achieved(
  IN level text,
  IN entity_id uuid,
  IN role_id uuid
) RETURNS boolean AS $_PGFN_$
DECLARE
  c int;
BEGIN
  SELECT count(*)
  FROM myapp_events_public.member_events_required(member_events_achieved.level, member_events_achieved.entity_id, member_events_achieved.role_id) INTO c;
  RETURN c <= 0;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

