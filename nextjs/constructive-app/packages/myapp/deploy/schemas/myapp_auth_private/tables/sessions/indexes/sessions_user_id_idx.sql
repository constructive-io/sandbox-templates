-- Deploy: schemas/myapp_auth_private/tables/sessions/indexes/sessions_user_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/sessions/columns/user_id/column


CREATE INDEX sessions_user_id_idx ON myapp_auth_private.sessions USING BTREE ( user_id );

