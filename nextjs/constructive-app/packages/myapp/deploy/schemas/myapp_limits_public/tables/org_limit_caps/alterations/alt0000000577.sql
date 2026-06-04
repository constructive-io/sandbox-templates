-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/alterations/alt0000000577
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/table


ALTER TABLE myapp_limits_public.org_limit_caps 
  DISABLE ROW LEVEL SECURITY;

