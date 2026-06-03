-- Deploy: schemas/myapp_auth_private/procedures/auth_settings/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


CREATE FUNCTION myapp_auth_private.auth_settings() RETURNS myapp_auth_private.app_settings_auth AS $_PGFN_$
DECLARE
  settings myapp_auth_private.app_settings_auth;
BEGIN
  SELECT *
  FROM myapp_auth_private.app_settings_auth
  LIMIT
  1 INTO settings;
  RETURN settings;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

