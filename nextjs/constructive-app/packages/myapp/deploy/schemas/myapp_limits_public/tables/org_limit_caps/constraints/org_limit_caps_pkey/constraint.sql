-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/constraints/org_limit_caps_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/table


ALTER TABLE myapp_limits_public.org_limit_caps 
  ADD CONSTRAINT org_limit_caps_pkey PRIMARY KEY (id);

