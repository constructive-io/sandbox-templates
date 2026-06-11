-- Deploy: schemas/myapp_limits_private/trigger_fns/org_limit_aggregates_inc_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/procedures/org_limit_aggregates_inc/procedure


CREATE FUNCTION myapp_limits_private.org_limit_aggregates_inc_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  limit_ok boolean;
  actor_id uuid;
  limitname citext;
BEGIN
  IF tg_nargs < 1 THEN
    RAISE EXCEPTION 'LIMIT_TRIGGER_ARGS (%)', tg_name;
  ELSIF tg_nargs = 1 THEN
    limitname := (tg_argv)[0];
    limit_ok := myapp_limits_private.org_limit_aggregates_inc(limitname);
  ELSIF tg_nargs >= 2 THEN
    limitname := (tg_argv)[0];
    EXECUTE pg_catalog.format('SELECT ($1).%s', (tg_argv)[1]) INTO actor_id USING NEW;
    limit_ok := myapp_limits_private.org_limit_aggregates_inc(limitname, actor_id);
  END IF;
  IF limit_ok = false THEN
    RAISE EXCEPTION 'LIMIT_REACHED';
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

