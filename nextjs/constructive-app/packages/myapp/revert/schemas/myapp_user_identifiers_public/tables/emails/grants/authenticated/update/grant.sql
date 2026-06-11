-- Revert: schemas/myapp_user_identifiers_public/tables/emails/grants/authenticated/update/grant


REVOKE UPDATE (is_primary, name) ON myapp_user_identifiers_public.emails FROM authenticated;


