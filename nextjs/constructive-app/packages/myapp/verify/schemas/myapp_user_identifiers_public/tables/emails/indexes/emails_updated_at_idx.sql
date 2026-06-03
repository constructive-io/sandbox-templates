-- Verify: schemas/myapp_user_identifiers_public/tables/emails/indexes/emails_updated_at_idx


SELECT verify_index('myapp_user_identifiers_public.emails', 'emails_updated_at_idx');


