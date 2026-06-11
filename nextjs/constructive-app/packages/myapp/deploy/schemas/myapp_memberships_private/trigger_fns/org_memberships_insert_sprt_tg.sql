-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_memberships_insert_sprt_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_members/table
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/table
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/table


CREATE FUNCTION myapp_memberships_private.org_memberships_insert_sprt_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  has_active_parent boolean;
BEGIN
  IF NEW.is_owner IS true THEN
    new.is_admin := true;
    new.is_approved := true;
    new.is_disabled := false;
    new.is_banned := false;
    new.is_read_only := false;
  END IF;
  new.is_active := (NEW.is_approved IS true AND NEW.is_disabled IS false) AND NEW.is_banned IS false;
  IF NEW.is_active IS TRUE THEN
    SELECT
      EXISTS (SELECT 1
      FROM myapp_memberships_private.app_memberships_sprt
      WHERE
        actor_id = NEW.actor_id) INTO has_active_parent;
    IF has_active_parent IS TRUE THEN
      INSERT INTO myapp_memberships_private.org_memberships_sprt (
        is_owner,
        is_admin,
        permissions,
        actor_id,
        entity_id,
        is_read_only
      )
      VALUES
        (NEW.is_owner, NEW.is_admin, NEW.permissions, NEW.actor_id, NEW.entity_id, NEW.is_read_only);
      INSERT INTO myapp_memberships_public.org_members (
        is_admin,
        actor_id,
        entity_id
      )
      VALUES
        (NEW.is_admin, NEW.actor_id, NEW.entity_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

