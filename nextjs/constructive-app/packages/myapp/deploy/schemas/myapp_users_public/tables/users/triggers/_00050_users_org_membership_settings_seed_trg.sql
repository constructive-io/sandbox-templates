-- Deploy: schemas/myapp_users_public/tables/users/triggers/_00050_users_org_membership_settings_seed_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_membership_settings_seed_fn


CREATE TRIGGER _00050_users_org_membership_settings_seed_trg
AFTER INSERT ON myapp_users_public.users
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_membership_settings_seed_fn ( );

