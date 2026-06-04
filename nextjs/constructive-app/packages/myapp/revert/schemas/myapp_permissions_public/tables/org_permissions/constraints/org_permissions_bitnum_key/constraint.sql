-- Revert: schemas/myapp_permissions_public/tables/org_permissions/constraints/org_permissions_bitnum_key/constraint


ALTER TABLE myapp_permissions_public.org_permissions 
  DROP CONSTRAINT org_permissions_bitnum_key;


