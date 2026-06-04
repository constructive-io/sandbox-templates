-- Deploy: schemas/myapp_memberships_private/trigger_fns/app_mbr_create
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table


CREATE FUNCTION myapp_memberships_private.app_mbr_create() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  INSERT INTO myapp_memberships_public.app_memberships (
    actor_id
  )
  VALUES
    (NEW.id);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

