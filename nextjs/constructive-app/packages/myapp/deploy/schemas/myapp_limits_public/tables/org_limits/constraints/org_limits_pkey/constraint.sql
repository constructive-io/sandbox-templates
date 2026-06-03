-- Deploy: schemas/myapp_limits_public/tables/org_limits/constraints/org_limits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table


ALTER TABLE myapp_limits_public.org_limits 
  ADD CONSTRAINT org_limits_pkey PRIMARY KEY (id);

