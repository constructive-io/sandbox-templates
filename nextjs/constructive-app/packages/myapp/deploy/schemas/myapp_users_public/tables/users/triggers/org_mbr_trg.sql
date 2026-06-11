-- Deploy: schemas/myapp_users_public/tables/users/triggers/org_mbr_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_mbr_create


CREATE TRIGGER org_mbr_trg
AFTER INSERT ON myapp_users_public.users
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_mbr_create ( );

