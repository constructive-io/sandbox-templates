-- Deploy: schemas/myapp_auth_private/tables/session_credentials/indexes/session_credentials_session_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/session_id/column


CREATE INDEX session_credentials_session_id_idx ON myapp_auth_private.session_credentials USING BTREE ( session_id );

