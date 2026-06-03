-- Verify: schemas/myapp_permissions_public/tables/app_permission_defaults/policies/auth_del_app_mem/policy


SELECT verify_policy('auth_del_app_mem', 'myapp_permissions_public.app_permission_defaults');


