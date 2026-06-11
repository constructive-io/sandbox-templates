-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/created_at/column


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP COLUMN created_at RESTRICT;


