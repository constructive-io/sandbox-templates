-- Verify: schemas/myapp_invites_public/tables/org_claimed_invites/policies/auth_sel_sender/policy


SELECT verify_policy('auth_sel_sender', 'myapp_invites_public.org_claimed_invites');


