-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/purchased_credits/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ADD COLUMN purchased_credits bigint;

