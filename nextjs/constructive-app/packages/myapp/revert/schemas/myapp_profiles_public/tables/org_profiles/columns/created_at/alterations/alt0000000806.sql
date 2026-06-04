-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/created_at/alterations/alt0000000806


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN created_at DROP DEFAULT;


