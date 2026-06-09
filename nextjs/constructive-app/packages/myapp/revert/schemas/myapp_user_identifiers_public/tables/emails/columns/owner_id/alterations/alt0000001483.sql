-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/owner_id/alterations/alt0000001483


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN owner_id DROP NOT NULL;


