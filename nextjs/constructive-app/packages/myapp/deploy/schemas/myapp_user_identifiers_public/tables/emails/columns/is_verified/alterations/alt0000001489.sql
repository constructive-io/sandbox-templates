-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/is_verified/alterations/alt0000001489
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/is_verified/column


COMMENT ON COLUMN myapp_user_identifiers_public.emails.is_verified IS 'Whether the email address has been verified via confirmation link';

