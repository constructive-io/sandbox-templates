-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/labels/column


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP COLUMN labels RESTRICT;


