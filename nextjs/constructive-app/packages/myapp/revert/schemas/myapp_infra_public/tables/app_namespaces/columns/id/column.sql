-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/id/column


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP COLUMN id RESTRICT;


