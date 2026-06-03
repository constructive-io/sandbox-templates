-- Revert: schemas/myapp_user_identifiers_public/tables/emails/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_user_identifiers_public.emails FROM authenticated;


