-- Deploy: schemas/myapp_limits_public/tables/app_limits/triggers/_99999_app_limits_audit_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table
-- requires: schemas/myapp_limits_private/trigger_fns/app_limits_audit_tg_fn


CREATE TRIGGER _99999_app_limits_audit_tg
BEFORE INSERT OR UPDATE ON myapp_limits_public.app_limits
FOR EACH ROW
EXECUTE PROCEDURE myapp_limits_private.app_limits_audit_tg_fn ( );

