-- Deploy: schemas/myapp_profiles_public/tables/app_profile_grants/triggers/app_profile_grants_apply_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_private/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/table
-- requires: schemas/myapp_profiles_private/trigger_fns/app_profile_grants_apply_tg


CREATE TRIGGER app_profile_grants_apply_trg
AFTER INSERT ON myapp_profiles_public.app_profile_grants
FOR EACH ROW
EXECUTE PROCEDURE myapp_profiles_private.app_profile_grants_apply_tg ( );

