-- Revert: schemas/myapp_store_public/tables/app_config/columns/labels/column


ALTER TABLE myapp_store_public.app_config 
  DROP COLUMN labels RESTRICT;


