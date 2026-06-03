-- Deploy: schemas/myapp_invites_private/trigger_fns/org_invites_profile_check_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_private/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/table


CREATE FUNCTION myapp_invites_private.org_invites_profile_check_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_mode text := 'strict';
  v_profile_perms bit varying;
  v_inviter_perms bit varying;
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    IF NEW.email IS NULL OR NEW.multiple IS TRUE THEN
      RAISE EXCEPTION 'PROFILE_ASSIGNMENT_REQUIRES_EMAIL_INVITE';
    END IF;
    SELECT s.invite_profile_assignment_mode
    FROM myapp_memberships_public.org_membership_settings AS s
    WHERE
      s.entity_id = NEW.entity_id INTO v_mode;
    SELECT p.permissions
    FROM myapp_profiles_public.org_profiles AS p
    WHERE
      p.id = NEW.profile_id INTO v_profile_perms;
    IF NOT (FOUND) THEN
      RAISE EXCEPTION 'PROFILE_NOT_FOUND';
    END IF;
    IF v_mode = 'strict' OR v_mode = 'permission_only' THEN
      IF NOT (myapp_memberships_private.org_memberships_perm_check('assign_profiles', NEW.entity_id, NEW.sender_id) IS TRUE) THEN
        RAISE EXCEPTION 'ASSIGN_PROFILES_PERMISSION_REQUIRED';
      END IF;
    END IF;
    IF v_mode = 'strict' OR v_mode = 'subset_only' THEN
      SELECT m.permissions
      FROM myapp_memberships_public.org_memberships AS m
      WHERE
        m.actor_id = NEW.sender_id AND m.entity_id = NEW.entity_id INTO v_inviter_perms;
      IF NOT (FOUND) THEN
        RAISE EXCEPTION 'MEMBERSHIP_NOT_FOUND';
      END IF;
      IF (v_profile_perms & (~v_inviter_perms)) <> (v_inviter_perms & (~v_inviter_perms)) THEN
        RAISE EXCEPTION 'PROFILE_EXCEEDS_PERMISSIONS';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

