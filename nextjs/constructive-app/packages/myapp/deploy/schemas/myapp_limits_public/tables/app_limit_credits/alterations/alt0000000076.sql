-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/alterations/alt0000000076
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/table


ALTER TABLE myapp_limits_public.app_limit_credits 
  DISABLE ROW LEVEL SECURITY;

