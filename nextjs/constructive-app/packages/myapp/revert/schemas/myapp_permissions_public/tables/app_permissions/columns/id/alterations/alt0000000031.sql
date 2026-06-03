-- Revert: schemas/myapp_permissions_public/tables/app_permissions/columns/id/alterations/alt0000000031


ALTER TABLE myapp_permissions_public.app_permissions 
  ALTER COLUMN id DROP NOT NULL;


