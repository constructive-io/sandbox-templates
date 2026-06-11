-- Revert: schemas/myapp_memberships_public/tables/membership_types/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.membership_types FROM authenticated;


