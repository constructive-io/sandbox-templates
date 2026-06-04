-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/name/alterations/alt0000001453
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/name/column


COMMENT ON COLUMN myapp_user_identifiers_public.emails.name IS E'Optional user-provided label for this email (e.g. "Work", "Personal").';

