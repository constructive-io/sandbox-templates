-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/constraints/app_limit_warnings_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/table


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ADD CONSTRAINT app_limit_warnings_pkey PRIMARY KEY (id);

