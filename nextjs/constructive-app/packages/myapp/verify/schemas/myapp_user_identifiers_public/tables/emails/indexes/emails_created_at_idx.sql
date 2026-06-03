-- Verify: schemas/myapp_user_identifiers_public/tables/emails/indexes/emails_created_at_idx


SELECT verify_index('myapp_user_identifiers_public.emails', 'emails_created_at_idx');


