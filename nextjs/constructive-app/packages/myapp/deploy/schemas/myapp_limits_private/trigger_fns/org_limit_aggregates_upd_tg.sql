-- Deploy: schemas/myapp_limits_private/trigger_fns/org_limit_aggregates_upd_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/procedures/org_limit_aggregates_dec/procedure
-- requires: schemas/myapp_limits_private/procedures/org_limit_aggregates_inc/procedure


CREATE FUNCTION myapp_limits_private.org_limit_aggregates_upd_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  limit_ok boolean;
  old_actor_id uuid;
  new_actor_id uuid;
  limitname citext;
BEGIN
  IF tg_nargs < 1 THEN
    RAISE EXCEPTION 'LIMIT_TRIGGER_ARGS (%)', tg_name;
  ELSIF tg_nargs = 1 THEN
    RAISE EXCEPTION 'LIMIT_TRIGGER_ARGS (%)', tg_name;
  ELSIF tg_nargs >= 2 THEN
    limitname := (tg_argv)[0];
    EXECUTE pg_catalog.format('SELECT ($1).%s', (tg_argv)[1]) INTO new_actor_id USING NEW;
    EXECUTE pg_catalog.format('SELECT ($1).%s', (tg_argv)[1]) INTO old_actor_id USING OLD;
    PERFORM myapp_limits_private.org_limit_aggregates_dec(limitname, old_actor_id);
    limit_ok := myapp_limits_private.org_limit_aggregates_inc(limitname, new_actor_id);
  END IF;
  IF limit_ok = false THEN
    RAISE EXCEPTION 'LIMIT_REACHED';
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

