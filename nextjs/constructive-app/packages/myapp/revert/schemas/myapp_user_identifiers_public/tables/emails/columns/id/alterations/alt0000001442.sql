-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/id/alterations/alt0000001442


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN id DROP DEFAULT;


