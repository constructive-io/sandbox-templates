-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_active/alterations/alt0000000225


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_active DROP NOT NULL;


