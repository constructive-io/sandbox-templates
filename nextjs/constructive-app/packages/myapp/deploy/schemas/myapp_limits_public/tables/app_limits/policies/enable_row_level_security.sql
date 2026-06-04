-- Deploy: schemas/myapp_limits_public/tables/app_limits/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table


ALTER TABLE myapp_limits_public.app_limits 
  ENABLE ROW LEVEL SECURITY;

