-- Verify: schemas/myapp_invites_public/tables/org_invites/policies/auth_del_dir_own/policy


SELECT verify_policy('auth_del_dir_own', 'myapp_invites_public.org_invites');


