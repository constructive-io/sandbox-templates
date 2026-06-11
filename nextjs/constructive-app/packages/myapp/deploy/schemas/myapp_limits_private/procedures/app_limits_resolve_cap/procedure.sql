-- Deploy: schemas/myapp_limits_private/procedures/app_limits_resolve_cap/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema


CREATE FUNCTION myapp_limits_private.app_limits_resolve_cap(
  IN p_cap_name citext
) RETURNS bigint AS $_PGFN_$
DECLARE
  v_cap_value bigint;
BEGIN
  SELECT max
  FROM myapp_limits_public.app_limit_caps_defaults
  WHERE
    name = app_limits_resolve_cap.p_cap_name INTO v_cap_value;
  RETURN COALESCE(v_cap_value, 0::bigint);
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

