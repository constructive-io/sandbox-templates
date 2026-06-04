-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/triggers/_00010_org_memberships_utrg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_memberships_utg


CREATE TRIGGER _00010_org_memberships_utrg
BEFORE UPDATE ON myapp_memberships_public.org_memberships
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_memberships_utg ( );

