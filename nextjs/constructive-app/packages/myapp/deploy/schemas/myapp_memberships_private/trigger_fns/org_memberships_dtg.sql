-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_memberships_dtg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


CREATE FUNCTION myapp_memberships_private.org_memberships_dtg() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF (SELECT
    NOT (EXISTS (SELECT 1
    FROM myapp_memberships_public.org_memberships
    WHERE
      (entity_id = OLD.entity_id AND is_owner = true) AND actor_id <> OLD.actor_id))) THEN
    IF (SELECT
      count(*) > 0
    FROM myapp_memberships_public.org_memberships
    WHERE
      entity_id = OLD.entity_id AND actor_id <> OLD.actor_id) THEN
      RAISE EXCEPTION 'REQUIRES_ONE_OWNER';
    END IF;
  END IF;
  RETURN OLD;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

