-- Deploy: schemas/myapp_limits_public/tables/org_limits/alterations/alt0000000485
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table


ALTER TABLE myapp_limits_public.org_limits 
  DISABLE ROW LEVEL SECURITY;

