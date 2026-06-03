-- Deploy: schemas/myapp_users_public/tables/users/triggers/_00060_users_org_profile_templates_seed_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_profiles_private/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_profiles_private/trigger_fns/org_profile_templates_seed_fn


CREATE TRIGGER _00060_users_org_profile_templates_seed_trg
AFTER INSERT ON myapp_users_public.users
FOR EACH ROW
EXECUTE PROCEDURE myapp_profiles_private.org_profile_templates_seed_fn ( );

