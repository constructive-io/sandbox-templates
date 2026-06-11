-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_memberships_member_profile_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema


CREATE FUNCTION myapp_memberships_private.org_memberships_member_profile_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_populate_email boolean := true;
BEGIN
  SELECT s.populate_member_email
  FROM myapp_memberships_public.org_membership_settings AS s
  WHERE
    s.entity_id = NEW.entity_id
  LIMIT
  1 INTO v_populate_email;
  IF NOT (v_populate_email) THEN
    INSERT INTO myapp_memberships_public.org_member_profiles (
      membership_id,
      entity_id,
      actor_id
    )
    VALUES
      (NEW.id, NEW.entity_id, NEW.actor_id);
    RETURN NEW;
  END IF;
  INSERT INTO myapp_memberships_public.org_member_profiles (
    membership_id,
    entity_id,
    actor_id,
    display_name,
    profile_picture
  )
  SELECT
    NEW.id,
    NEW.entity_id,
    NEW.actor_id,
    COALESCE(u.display_name, ''),
    u.profile_picture
  FROM myapp_users_public.users AS u
  WHERE
    u.id = NEW.actor_id
  LIMIT
  1;
  IF NOT (FOUND) THEN
    INSERT INTO myapp_memberships_public.org_member_profiles (
      membership_id,
      entity_id,
      actor_id
    )
    VALUES
      (NEW.id, NEW.entity_id, NEW.actor_id);
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

