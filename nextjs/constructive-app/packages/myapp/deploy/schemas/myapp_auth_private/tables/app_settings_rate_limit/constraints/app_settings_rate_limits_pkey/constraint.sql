-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/constraints/app_settings_rate_limits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ADD CONSTRAINT app_settings_rate_limits_pkey PRIMARY KEY (id);

