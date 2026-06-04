-- Deploy: schemas/myapp_auth_private/tables/session_credentials/indexes/session_credentials_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/updated_at/column


CREATE INDEX session_credentials_updated_at_idx ON myapp_auth_private.session_credentials ( updated_at );

