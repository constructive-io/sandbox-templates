-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/indexes/audit_log_auths_event_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/column


CREATE INDEX audit_log_auths_event_idx ON myapp_logging_public.audit_log_auth USING BTREE ( event );

