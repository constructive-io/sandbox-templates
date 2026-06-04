-- Deploy: schemas/myapp_memberships_public/tables/org_members/constraints/org_members_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_members/table


ALTER TABLE myapp_memberships_public.org_members 
  ADD CONSTRAINT org_members_pkey PRIMARY KEY (id);

