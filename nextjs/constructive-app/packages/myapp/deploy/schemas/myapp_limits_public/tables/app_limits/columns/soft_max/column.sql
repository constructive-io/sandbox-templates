-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/soft_max/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table


ALTER TABLE myapp_limits_public.app_limits 
  ADD COLUMN soft_max bigint;

