-- Revert: schemas/myapp_permissions_public/tables/app_permissions/columns/bitnum/alterations/alt0000000034


ALTER TABLE myapp_permissions_public.app_permissions 
  DROP CONSTRAINT app_permissions_bitnum_chk;


