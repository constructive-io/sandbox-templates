-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/is_verified/alterations/alt0000001447


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN is_verified DROP NOT NULL;


