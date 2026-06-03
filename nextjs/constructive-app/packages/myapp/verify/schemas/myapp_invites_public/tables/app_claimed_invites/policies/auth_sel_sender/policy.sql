-- Verify: schemas/myapp_invites_public/tables/app_claimed_invites/policies/auth_sel_sender/policy


SELECT verify_policy('auth_sel_sender', 'myapp_invites_public.app_claimed_invites');


