-- Deploy: schemas/myapp_memberships_public/tables/org_admin_grants/constraints/org_admin_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_admin_grants/table


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ADD CONSTRAINT org_admin_grants_pkey PRIMARY KEY (id);

