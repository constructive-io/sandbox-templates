-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/constraints/app_profiles_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table


ALTER TABLE myapp_profiles_public.app_profiles 
  ADD CONSTRAINT app_profiles_name_key 
    UNIQUE (name);

