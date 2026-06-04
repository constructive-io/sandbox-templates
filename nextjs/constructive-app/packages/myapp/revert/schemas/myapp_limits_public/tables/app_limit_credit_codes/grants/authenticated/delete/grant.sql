-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_limits_public.app_limit_credit_codes FROM authenticated;


