-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/columns/max/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table


ALTER TABLE myapp_limits_public.app_limit_caps 
  ADD COLUMN max bigint;

