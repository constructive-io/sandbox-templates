-- Verify: schemas/myapp_memberships_public/tables/app_permission_default_permissions/policies/auth_del_app_mem/policy


SELECT verify_policy('auth_del_app_mem', 'myapp_memberships_public.app_permission_default_permissions');


