-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/email/alterations/alt0000001485
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/email/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN email SET NOT NULL;

