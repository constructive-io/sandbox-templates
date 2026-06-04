-- Deploy: schemas/myapp_limits_public/tables/app_limits/alterations/alt0000000048
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table


ALTER TABLE myapp_limits_public.app_limits 
  DISABLE ROW LEVEL SECURITY;

