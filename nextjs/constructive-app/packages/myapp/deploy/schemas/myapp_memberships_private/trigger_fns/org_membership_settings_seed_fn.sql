-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_membership_settings_seed_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema


CREATE FUNCTION myapp_memberships_private.org_membership_settings_seed_fn() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  INSERT INTO myapp_memberships_public.org_membership_settings (
    entity_id
  )
  VALUES
    (NEW.id);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

