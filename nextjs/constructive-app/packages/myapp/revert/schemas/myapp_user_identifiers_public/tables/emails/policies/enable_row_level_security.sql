-- Revert: schemas/myapp_user_identifiers_public/tables/emails/policies/enable_row_level_security


ALTER TABLE myapp_user_identifiers_public.emails 
  DISABLE ROW LEVEL SECURITY;


