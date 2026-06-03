-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/triggers/_99999_app_memberships_delete_sprt
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_private/trigger_fns/app_memberships_delete_sprt_tg


CREATE TRIGGER _99999_app_memberships_delete_sprt
AFTER DELETE ON myapp_memberships_public.app_memberships
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.app_memberships_delete_sprt_tg ( );

