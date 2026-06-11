-- Deploy: schemas/myapp_limits_public/procedures/seed_org_limit_caps_defaults/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table


CREATE FUNCTION myapp_limits_public.seed_org_limit_caps_defaults(
  IN defaults jsonb
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_item jsonb;
BEGIN
  IF seed_org_limit_caps_defaults.defaults IS NULL THEN
    RAISE EXCEPTION 'seed_cap_defaults: defaults is required';
  END IF;
  FOR v_item IN SELECT jsonb_array_elements(seed_org_limit_caps_defaults.defaults) LOOP
    INSERT INTO myapp_limits_public.org_limit_caps_defaults (
      name,
      max
    )
    VALUES
      ((v_item->>'name')::citext, (v_item->>'max')::bigint)
    ON CONFLICT ON CONSTRAINT org_limit_caps_defaults_name_key DO UPDATE SET
    max = EXCLUDED.max;
  END LOOP;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

