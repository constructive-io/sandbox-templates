-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/plan_max/alterations/alt0000000497
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/plan_max/column


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN plan_max SET DEFAULT 0;

