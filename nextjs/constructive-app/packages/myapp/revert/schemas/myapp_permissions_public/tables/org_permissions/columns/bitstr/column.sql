-- Revert: schemas/myapp_permissions_public/tables/org_permissions/columns/bitstr/column


ALTER TABLE myapp_permissions_public.org_permissions 
  DROP COLUMN bitstr RESTRICT;


