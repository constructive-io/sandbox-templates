-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/constraints/org_permission_default_permissions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  ADD CONSTRAINT org_permission_default_permissions_pkey PRIMARY KEY (id);

