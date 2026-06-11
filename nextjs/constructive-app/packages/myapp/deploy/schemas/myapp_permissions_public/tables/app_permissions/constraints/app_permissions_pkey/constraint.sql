-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/constraints/app_permissions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table


ALTER TABLE myapp_permissions_public.app_permissions 
  ADD CONSTRAINT app_permissions_pkey PRIMARY KEY (id);

