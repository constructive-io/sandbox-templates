-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/indexes/auth_ip_rate_limits_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/updated_at/column


CREATE INDEX auth_ip_rate_limits_updated_at_idx ON myapp_auth_private.auth_ip_rate_limits ( updated_at );

