-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/id/alterations/alt0000000244


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN id DROP NOT NULL;


