-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/constraints/app_namespaces_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


ALTER TABLE myapp_infra_public.app_namespaces 
  ADD CONSTRAINT app_namespaces_pkey PRIMARY KEY (id);

