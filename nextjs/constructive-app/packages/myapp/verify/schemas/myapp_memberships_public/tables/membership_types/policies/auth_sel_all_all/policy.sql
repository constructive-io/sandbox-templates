-- Verify: schemas/myapp_memberships_public/tables/membership_types/policies/auth_sel_all_all/policy


SELECT verify_policy('auth_sel_all_all', 'myapp_memberships_public.membership_types');


