-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/id/alterations/alt0000001441


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN id DROP NOT NULL;


