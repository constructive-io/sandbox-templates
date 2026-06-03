-- Deploy: schemas/myapp_limits_public/tables/org_limit_warnings/alterations/alt0000000588
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/table


ALTER TABLE myapp_limits_public.org_limit_warnings 
  DISABLE ROW LEVEL SECURITY;

