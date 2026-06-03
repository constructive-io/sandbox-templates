-- Verify: schemas/myapp_user_identifiers_public/tables/emails/indexes/emails_is_primary_idx


SELECT verify_index('myapp_user_identifiers_public.emails', 'emails_is_primary_idx');


