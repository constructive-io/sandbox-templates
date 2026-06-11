-- Revert: schemas/myapp_infra_public/tables/app_namespaces/constraints/app_namespaces_namespace_name_key/constraint


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP CONSTRAINT app_namespaces_namespace_name_key;


