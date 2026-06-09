-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/updated_at/alterations/alt0000001495


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN updated_at DROP DEFAULT;


