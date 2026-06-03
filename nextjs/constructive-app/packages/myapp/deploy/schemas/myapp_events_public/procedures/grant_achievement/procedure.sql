-- Deploy: schemas/myapp_events_public/procedures/grant_achievement/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table
-- requires: schemas/myapp_events_public/procedures/events_achieved/procedure


CREATE FUNCTION myapp_events_public.grant_achievement(
  IN level_name text,
  IN actor_id uuid
) RETURNS void AS $_PGFN_$
BEGIN
  IF myapp_events_public.events_achieved(grant_achievement.level_name, grant_achievement.actor_id) THEN
    INSERT INTO myapp_events_public.app_level_grants (
      actor_id,
      level_name
    )
    VALUES
      (grant_achievement.actor_id, grant_achievement.level_name)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

