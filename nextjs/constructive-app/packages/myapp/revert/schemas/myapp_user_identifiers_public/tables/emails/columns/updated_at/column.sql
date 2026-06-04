-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/updated_at/column


ALTER TABLE myapp_user_identifiers_public.emails 
  DROP COLUMN updated_at RESTRICT;


