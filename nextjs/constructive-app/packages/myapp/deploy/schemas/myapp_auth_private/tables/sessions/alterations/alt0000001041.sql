-- Deploy: schemas/myapp_auth_private/tables/sessions/alterations/alt0000001041
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table


COMMENT ON TABLE myapp_auth_private.sessions IS E'Tracks user authentication sessions with expiration, fingerprinting, and step-up verification state';

