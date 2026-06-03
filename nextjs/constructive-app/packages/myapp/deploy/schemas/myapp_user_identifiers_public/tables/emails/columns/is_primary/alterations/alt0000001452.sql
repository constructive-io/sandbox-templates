-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/is_primary/alterations/alt0000001452
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/is_primary/column


COMMENT ON COLUMN myapp_user_identifiers_public.emails.is_primary IS E'Whether this is the user''s primary email address';

