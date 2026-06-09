-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/columns/owner_id/alterations/alt0000001484
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/columns/owner_id/column


ALTER TABLE myapp_user_identifiers_public.emails 
  ALTER COLUMN owner_id SET DEFAULT jwt_public.current_user_id();

