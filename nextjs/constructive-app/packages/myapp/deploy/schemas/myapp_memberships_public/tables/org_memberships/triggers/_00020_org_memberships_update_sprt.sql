-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/triggers/_00020_org_memberships_update_sprt
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_memberships_update_sprt_tg


CREATE TRIGGER _00020_org_memberships_update_sprt
AFTER UPDATE ON myapp_memberships_public.org_memberships
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_memberships_update_sprt_tg ( );

