-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/constraints/app_settings_auths_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  ADD CONSTRAINT app_settings_auths_pkey PRIMARY KEY (id);

