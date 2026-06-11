-- Deploy: schemas/myapp_limits_private/trigger_fns/app_limits_cap_check_tg_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema


CREATE FUNCTION myapp_limits_private.app_limits_cap_check_tg_fn() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_cap_name citext;
  v_cap_value bigint;
BEGIN
  IF tg_nargs < 1 THEN
    RAISE EXCEPTION 'CAP_CHECK_TRIGGER_ARGS (%)', tg_name;
  END IF;
  v_cap_value := (tg_argv)[0];
  SELECT myapp_limits_private.app_limits_resolve_cap(v_cap_name) INTO v_cap_value;
  IF pg_catalog.coalesce(v_cap_value, 0) <= 0 THEN
    RAISE EXCEPTION 'FEATURE_DISABLED (%)', v_cap_name;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

