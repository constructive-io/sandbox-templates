-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_memberships_public.org_membership_settings
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

