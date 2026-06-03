-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/soft_max/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ADD COLUMN soft_max bigint;

