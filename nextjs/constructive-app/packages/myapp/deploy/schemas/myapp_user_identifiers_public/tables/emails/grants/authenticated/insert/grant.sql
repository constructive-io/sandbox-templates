-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


GRANT INSERT (email, owner_id, is_primary, name) ON myapp_user_identifiers_public.emails TO authenticated;

