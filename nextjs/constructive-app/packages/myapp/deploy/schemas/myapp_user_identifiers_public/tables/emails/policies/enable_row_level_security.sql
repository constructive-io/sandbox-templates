-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


ALTER TABLE myapp_user_identifiers_public.emails 
  ENABLE ROW LEVEL SECURITY;

