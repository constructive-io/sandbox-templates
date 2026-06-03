-- Verify: schemas/myapp_invites_public/tables/app_invites/policies/auth_sel_dir_own/policy


SELECT verify_policy('auth_sel_dir_own', 'myapp_invites_public.app_invites');


