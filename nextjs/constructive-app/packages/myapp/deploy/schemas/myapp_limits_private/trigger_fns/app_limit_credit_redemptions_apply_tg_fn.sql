-- Deploy: schemas/myapp_limits_private/trigger_fns/app_limit_credit_redemptions_apply_tg_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table


CREATE FUNCTION myapp_limits_private.app_limit_credit_redemptions_apply_tg_fn() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_code myapp_limits_public.app_limit_credit_codes;
BEGIN
  SELECT *
  FROM myapp_limits_public.app_limit_credit_codes
  WHERE
    id = NEW.credit_code_id
  FOR UPDATE INTO v_code;
  IF NOT (FOUND) THEN
    RAISE WARNING 'CREDIT_CODE_NOT_FOUND';
  END IF;
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < pg_catalog.now() THEN
    RAISE WARNING 'CREDIT_CODE_EXPIRED';
  END IF;
  IF v_code.max_redemptions IS NOT NULL AND v_code.current_redemptions >= v_code.max_redemptions THEN
    RAISE WARNING 'CREDIT_CODE_MAX_REDEMPTIONS_REACHED';
  END IF;
  UPDATE myapp_limits_public.app_limit_credit_codes SET
  current_redemptions = current_redemptions + 1
  WHERE
    id = v_code.id;
  INSERT INTO myapp_limits_public.app_limit_credits (
    default_limit_id,
    actor_id,
    amount,
    credit_type,
    reason
  )
  SELECT
    ci.default_limit_id,
    NEW.entity_id,
    ci.amount,
    ci.credit_type,
    'credit_code:' || v_code.id::text
  FROM myapp_limits_public.app_limit_credit_code_items AS ci
  WHERE
    ci.credit_code_id = v_code.id;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

