-- Verify: schemas/myapp_invites_public/tables/org_invites/policies/auth_ins_create_invite_check/policy


SELECT verify_policy('auth_ins_create_invite_check', 'myapp_invites_public.org_invites');


