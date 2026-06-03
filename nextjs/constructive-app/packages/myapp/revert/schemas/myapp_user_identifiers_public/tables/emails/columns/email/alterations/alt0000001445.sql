-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/email/alterations/alt0000001445


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN email DROP NOT NULL;


