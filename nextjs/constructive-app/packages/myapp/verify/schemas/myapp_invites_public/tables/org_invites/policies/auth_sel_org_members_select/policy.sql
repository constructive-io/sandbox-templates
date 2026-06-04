-- Verify: schemas/myapp_invites_public/tables/org_invites/policies/auth_sel_org_members_select/policy


SELECT verify_policy('auth_sel_org_members_select', 'myapp_invites_public.org_invites');


