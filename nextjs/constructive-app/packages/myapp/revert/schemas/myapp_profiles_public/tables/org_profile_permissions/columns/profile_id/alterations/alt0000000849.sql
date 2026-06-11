-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/profile_id/alterations/alt0000000849


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN profile_id DROP NOT NULL;


