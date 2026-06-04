-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/created_at/alterations/alt0000001454


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN created_at DROP DEFAULT;


