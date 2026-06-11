-- Revert: schemas/myapp_memberships_public/tables/app_membership_defaults/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.app_membership_defaults FROM authenticated;


