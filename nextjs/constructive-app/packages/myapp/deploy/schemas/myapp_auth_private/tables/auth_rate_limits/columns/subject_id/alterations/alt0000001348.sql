-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/subject_id/alterations/alt0000001348
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/columns/subject_id/column


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN subject_id SET NOT NULL;

