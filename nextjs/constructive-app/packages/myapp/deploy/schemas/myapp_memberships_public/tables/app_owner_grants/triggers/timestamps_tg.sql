-- Deploy: schemas/myapp_memberships_public/tables/app_owner_grants/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_owner_grants/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_memberships_public.app_owner_grants
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

