-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/is_verified/alterations/alt0000001448


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN is_verified DROP DEFAULT;


