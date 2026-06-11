-- Deploy: schemas/myapp_store_private/procedures/app_secrets_verify/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


CREATE FUNCTION myapp_store_private.app_secrets_verify(
  IN secret_name text,
  IN value text,
  IN secret_namespace text DEFAULT 'default'
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
  v_secret_text text;
  v_secret myapp_store_private.app_secrets;
BEGIN
  SELECT ns.id
  FROM myapp_infra_public.app_namespaces AS ns
  WHERE
    ns.name = app_secrets_verify.secret_namespace INTO v_namespace_id;
  SELECT myapp_store_private.app_secrets_get(app_secrets_verify.secret_name, NULL::text, app_secrets_verify.secret_namespace) INTO v_secret_text;
  SELECT *
  FROM myapp_store_private.app_secrets AS s
  WHERE
    s.namespace_id = v_namespace_id AND s.name = app_secrets_verify.secret_name INTO v_secret;
  IF v_secret.algo = 'crypt' THEN
    RETURN v_secret_text = public.crypt(app_secrets_verify.value::bytea::text, v_secret_text);
  ELSIF v_secret.algo = 'pgp' THEN
    RETURN app_secrets_verify.value = v_secret_text;
  END IF;
  RETURN app_secrets_verify.value = v_secret_text;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

