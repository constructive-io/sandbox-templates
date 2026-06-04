-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/alterations/alt0000001439
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


ALTER TABLE myapp_user_identifiers_public.emails 
  DISABLE ROW LEVEL SECURITY;

