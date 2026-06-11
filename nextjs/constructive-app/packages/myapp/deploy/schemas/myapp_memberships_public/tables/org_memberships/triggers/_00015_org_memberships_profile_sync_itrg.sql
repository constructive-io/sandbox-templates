-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/triggers/_00015_org_memberships_profile_sync_itrg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_private/schema
-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_profiles_private/trigger_fns/org_memberships_profile_sync_tg


CREATE TRIGGER _00015_org_memberships_profile_sync_itrg
BEFORE INSERT ON myapp_memberships_public.org_memberships
FOR EACH ROW
EXECUTE PROCEDURE myapp_profiles_private.org_memberships_profile_sync_tg ( );

