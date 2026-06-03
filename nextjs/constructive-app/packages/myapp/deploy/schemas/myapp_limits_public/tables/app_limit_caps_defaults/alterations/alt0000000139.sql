-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps_defaults/alterations/alt0000000139
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps_defaults/table


ALTER TABLE myapp_limits_public.app_limit_caps_defaults 
  DISABLE ROW LEVEL SECURITY;

