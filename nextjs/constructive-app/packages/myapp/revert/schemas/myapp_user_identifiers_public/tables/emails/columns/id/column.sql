-- Revert: schemas/myapp_user_identifiers_public/tables/emails/columns/id/column


ALTER TABLE myapp_user_identifiers_public.emails 
  DROP COLUMN id RESTRICT;


