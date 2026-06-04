-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_profiles_public.app_profile_templates
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

