-- Deploy: schemas/myapp_memberships_public/tables/app_admin_grants/constraints/app_admin_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_admin_grants/table


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ADD CONSTRAINT app_admin_grants_pkey PRIMARY KEY (id);

