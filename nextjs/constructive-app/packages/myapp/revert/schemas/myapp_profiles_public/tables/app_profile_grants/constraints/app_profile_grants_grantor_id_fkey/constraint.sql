-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/constraints/app_profile_grants_grantor_id_fkey/constraint


ALTER TABLE myapp_profiles_public.app_profile_grants 
  DROP CONSTRAINT app_profile_grants_grantor_id_fkey;


