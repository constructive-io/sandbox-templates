-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/updated_at/alterations/alt0000001495
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/updated_at/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN updated_at SET DEFAULT now();

