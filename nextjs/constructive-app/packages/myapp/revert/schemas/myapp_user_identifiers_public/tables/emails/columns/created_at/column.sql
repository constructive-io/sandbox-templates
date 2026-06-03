-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/created_at/column


ALTER TABLE myapp_user_identifiers_public.emails 
  DROP COLUMN created_at RESTRICT;


