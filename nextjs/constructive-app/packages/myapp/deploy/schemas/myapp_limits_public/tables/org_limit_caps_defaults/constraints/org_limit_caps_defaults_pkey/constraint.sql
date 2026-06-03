-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/constraints/org_limit_caps_defaults_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table


ALTER TABLE myapp_limits_public.org_limit_caps_defaults 
  ADD CONSTRAINT org_limit_caps_defaults_pkey PRIMARY KEY (id);

