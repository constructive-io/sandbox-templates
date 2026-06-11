-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/triggers/_00100_org_limit_credits_apply_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table
-- requires: schemas/myapp_limits_private/trigger_fns/org_limit_credits_apply_tg_fn


CREATE TRIGGER _00100_org_limit_credits_apply_tg
AFTER INSERT ON myapp_limits_public.org_limit_credits
FOR EACH ROW
EXECUTE PROCEDURE myapp_limits_private.org_limit_credits_apply_tg_fn ( );

