-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/indexes/auth_rate_limits_subject_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/columns/subject_id/column


CREATE INDEX auth_rate_limits_subject_id_idx ON myapp_auth_private.auth_rate_limits USING BTREE ( subject_id );

