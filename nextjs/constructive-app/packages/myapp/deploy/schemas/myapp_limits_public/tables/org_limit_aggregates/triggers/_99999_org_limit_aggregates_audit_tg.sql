-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/triggers/_99999_org_limit_aggregates_audit_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table
-- requires: schemas/myapp_limits_private/trigger_fns/org_limit_aggregates_audit_tg_fn


CREATE TRIGGER _99999_org_limit_aggregates_audit_tg
BEFORE INSERT OR UPDATE ON myapp_limits_public.org_limit_aggregates
FOR EACH ROW
EXECUTE PROCEDURE myapp_limits_private.org_limit_aggregates_audit_tg_fn ( );

