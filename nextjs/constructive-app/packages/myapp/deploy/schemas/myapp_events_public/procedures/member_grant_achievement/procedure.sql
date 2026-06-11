-- Deploy: schemas/myapp_events_public/procedures/member_grant_achievement/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/procedures/member_events_achieved/procedure


CREATE FUNCTION myapp_events_public.member_grant_achievement(
  IN level_name text,
  IN entity_id uuid,
  IN actor_id uuid
) RETURNS void AS $_PGFN_$
BEGIN
  IF myapp_events_public.member_events_achieved(member_grant_achievement.level_name, member_grant_achievement.entity_id, member_grant_achievement.actor_id) THEN
    INSERT INTO myapp_events_public.org_level_grants (
      actor_id,
      level_name,
      entity_id
    )
    VALUES
      (member_grant_achievement.actor_id, member_grant_achievement.level_name, member_grant_achievement.entity_id)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

