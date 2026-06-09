-- Revert: schemas/myapp_permissions_public/tables/org_permissions/columns/bitnum/alterations/alt0000000485


ALTER TABLE myapp_permissions_public.org_permissions 
  DROP CONSTRAINT org_permissions_bitnum_chk;


