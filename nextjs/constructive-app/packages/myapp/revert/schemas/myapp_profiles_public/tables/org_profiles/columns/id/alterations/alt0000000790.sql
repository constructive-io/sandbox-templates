-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/id/alterations/alt0000000790


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN id DROP NOT NULL;


