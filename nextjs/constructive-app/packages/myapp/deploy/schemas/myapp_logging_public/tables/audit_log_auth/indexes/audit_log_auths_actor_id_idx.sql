-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/indexes/audit_log_auths_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/column


CREATE INDEX audit_log_auths_actor_id_idx ON myapp_logging_public.audit_log_auth USING BTREE ( actor_id );

