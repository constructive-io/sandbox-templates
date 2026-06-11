-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/table
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema


CREATE TABLE myapp_logging_public.audit_log_auth (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

