-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_permissions/triggers/app_permission_default_permissions_recompute_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table
-- requires: schemas/myapp_memberships_private/trigger_fns/app_permission_default_permissions_recompute_tg


CREATE TRIGGER app_permission_default_permissions_recompute_trg
BEFORE INSERT OR DELETE OR UPDATE ON myapp_memberships_public.app_permission_default_permissions
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.app_permission_default_permissions_recompute_tg ( );

