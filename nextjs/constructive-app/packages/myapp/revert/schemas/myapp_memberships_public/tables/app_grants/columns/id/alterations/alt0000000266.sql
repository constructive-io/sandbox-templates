-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/id/alterations/alt0000000266


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN id DROP NOT NULL;


