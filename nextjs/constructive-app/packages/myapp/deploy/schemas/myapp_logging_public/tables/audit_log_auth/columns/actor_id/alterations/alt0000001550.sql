-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/alterations/alt0000001550
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.actor_id IS E'User who performed the authentication action; NULL if user was deleted';

