-- Revert: schemas/myapp_memberships_public/tables/app_owner_grants/columns/id/alterations/alt0000000257


ALTER TABLE myapp_memberships_public.app_owner_grants 
  ALTER COLUMN id DROP DEFAULT;


