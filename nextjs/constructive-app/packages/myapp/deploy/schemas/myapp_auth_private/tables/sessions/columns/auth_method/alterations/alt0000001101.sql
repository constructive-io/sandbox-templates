-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/auth_method/alterations/alt0000001101
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/auth_method/column


COMMENT ON COLUMN myapp_auth_private.sessions.auth_method IS E'Authentication method used to create this session: password, identity, magic_link, email_otp, sms_otp, anonymous';

