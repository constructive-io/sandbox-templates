-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


ALTER TABLE myapp_user_identifiers_public.emails 
  ADD COLUMN updated_at timestamptz;

