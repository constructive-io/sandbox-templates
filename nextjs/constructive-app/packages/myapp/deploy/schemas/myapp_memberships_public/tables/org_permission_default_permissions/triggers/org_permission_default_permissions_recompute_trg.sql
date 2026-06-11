-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/triggers/org_permission_default_permissions_recompute_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_permission_default_permissions_recompute_tg


CREATE TRIGGER org_permission_default_permissions_recompute_trg
BEFORE INSERT OR DELETE OR UPDATE ON myapp_memberships_public.org_permission_default_permissions
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_permission_default_permissions_recompute_tg ( );

