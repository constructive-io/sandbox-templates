-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/is_primary/alterations/alt0000001451
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/is_primary/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN is_primary SET DEFAULT false;

