-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/created_at/alterations/alt0000001454
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/created_at/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN created_at SET DEFAULT now();

