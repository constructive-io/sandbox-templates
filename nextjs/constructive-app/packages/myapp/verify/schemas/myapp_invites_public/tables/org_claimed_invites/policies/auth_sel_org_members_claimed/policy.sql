-- Verify: schemas/myapp_invites_public/tables/org_claimed_invites/policies/auth_sel_org_members_claimed/policy


SELECT verify_policy('auth_sel_org_members_claimed', 'myapp_invites_public.org_claimed_invites');


