-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/is_verified/alterations/alt0000001447
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/is_verified/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN is_verified SET NOT NULL;

