-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/constraints/emails_email_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


ALTER TABLE myapp_user_identifiers_public.emails 
  ADD CONSTRAINT emails_email_key 
    UNIQUE (email);

