-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/created_at/alterations/alt0000000853


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN created_at DROP DEFAULT;


