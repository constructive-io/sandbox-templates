-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/is_primary/column


ALTER TABLE myapp_user_identifiers_public.emails 
  DROP COLUMN is_primary RESTRICT;


