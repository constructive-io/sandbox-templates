-- Verify: schemas/myapp_profiles_public/tables/org_profile_permissions/policies/auth_upd_rel_ent_mem/policy


SELECT verify_policy('auth_upd_rel_ent_mem', 'myapp_profiles_public.org_profile_permissions');


