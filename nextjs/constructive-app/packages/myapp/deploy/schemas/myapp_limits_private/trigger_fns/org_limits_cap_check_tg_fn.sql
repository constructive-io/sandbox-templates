-- Deploy: schemas/myapp_limits_private/trigger_fns/org_limits_cap_check_tg_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema


CREATE FUNCTION myapp_limits_private.org_limits_cap_check_tg_fn() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_cap_name citext;
  v_entity_id uuid;
  v_cap_value bigint;
BEGIN
  IF tg_nargs < 2 THEN
    RAISE EXCEPTION 'CAP_CHECK_TRIGGER_ARGS (%)', tg_name;
  END IF;
  v_entity_id := (tg_argv)[0];
  EXECUTE pg_catalog.format('SELECT ($1).%s', (tg_argv)[1]) INTO v_entity_id USING NEW;
  SELECT myapp_limits_private.org_limits_resolve_cap(v_cap_name, v_entity_id) INTO v_cap_value;
  IF pg_catalog.coalesce(v_cap_value, 0) <= 0 THEN
    RAISE EXCEPTION 'FEATURE_DISABLED (%)', v_cap_name;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

