-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/id/alterations/alt0000001441
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/id/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN id SET NOT NULL;

