-- Revert: schemas/myapp_user_identifiers_public/tables/emails/constraints/emails_owner_id_fkey/constraint


ALTER TABLE myapp_user_identifiers_public.emails 
  DROP CONSTRAINT emails_owner_id_fkey;


