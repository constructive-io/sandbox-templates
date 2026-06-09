-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/plan_max/alterations/alt0000000557
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/plan_max/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN plan_max SET DEFAULT 0;

