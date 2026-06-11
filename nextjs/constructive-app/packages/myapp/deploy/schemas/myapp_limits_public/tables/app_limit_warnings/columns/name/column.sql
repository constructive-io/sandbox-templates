-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/table


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ADD COLUMN name citext;

