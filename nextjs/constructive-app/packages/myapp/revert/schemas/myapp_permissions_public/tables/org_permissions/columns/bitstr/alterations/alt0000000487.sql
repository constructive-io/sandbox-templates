-- Revert: schemas/myapp_permissions_public/tables/org_permissions/columns/bitstr/alterations/alt0000000487


ALTER TABLE myapp_permissions_public.org_permissions 
  ALTER COLUMN bitstr DROP NOT NULL;


