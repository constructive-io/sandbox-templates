-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/window_start/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ADD COLUMN window_start timestamptz;

