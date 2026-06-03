-- Deploy: schemas/myapp_events_private/trigger_fns/member_tg_chk_achv
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table
-- requires: schemas/myapp_events_public/procedures/member_events_achieved/procedure


CREATE FUNCTION myapp_events_private.member_tg_chk_achv() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_level_name text;
BEGIN
  FOR v_level_name IN SELECT DISTINCT lr.level
  FROM myapp_events_public.org_level_requirements AS lr
  WHERE
    lr.name = NEW.name LOOP
    IF myapp_events_public.member_events_achieved(v_level_name, NEW.entity_id, NEW.actor_id) THEN
      INSERT INTO myapp_events_public.org_level_grants (
        actor_id,
        level_name,
        period_start,
        entity_id
      )
      VALUES
        (NEW.actor_id, v_level_name, coalesce(NEW.period_start, '-infinity'::timestamptz), NEW.entity_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

