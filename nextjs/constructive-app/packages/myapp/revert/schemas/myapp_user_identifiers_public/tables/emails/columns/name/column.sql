-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/name/column


ALTER TABLE myapp_user_identifiers_public.emails 
  DROP COLUMN name RESTRICT;


