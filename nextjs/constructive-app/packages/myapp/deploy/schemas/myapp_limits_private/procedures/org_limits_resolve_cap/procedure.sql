-- Deploy: schemas/myapp_limits_private/procedures/org_limits_resolve_cap/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema


CREATE FUNCTION myapp_limits_private.org_limits_resolve_cap(
  IN p_cap_name citext,
  IN p_entity_id uuid
) RETURNS bigint AS $_PGFN_$
DECLARE
  v_cap_value bigint;
BEGIN
  SELECT max
  FROM myapp_limits_public.org_limit_caps
  WHERE
    name = org_limits_resolve_cap.p_cap_name AND entity_id = org_limits_resolve_cap.p_entity_id INTO v_cap_value;
  IF v_cap_value IS NULL THEN
    SELECT max
    FROM myapp_limits_public.org_limit_caps_defaults
    WHERE
      name = org_limits_resolve_cap.p_cap_name INTO v_cap_value;
  END IF;
  RETURN COALESCE(v_cap_value, 0::bigint);
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

