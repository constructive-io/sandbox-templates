-- Revert: schemas/myapp_user_identifiers_public/tables/emails/grants/authenticated/select/grant


REVOKE SELECT ON myapp_user_identifiers_public.emails FROM authenticated;


