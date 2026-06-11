-- Verify: schemas/myapp_permissions_public/tables/app_permission_defaults/policies/auth_sel_all_all/policy


SELECT verify_policy('auth_sel_all_all', 'myapp_permissions_public.app_permission_defaults');


