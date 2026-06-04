-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table


ALTER TABLE myapp_limits_public.org_limit_caps_defaults 
  ENABLE ROW LEVEL SECURITY;

