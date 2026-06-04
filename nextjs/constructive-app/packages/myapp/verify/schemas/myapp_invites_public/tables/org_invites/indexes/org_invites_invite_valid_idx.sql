-- Verify: schemas/myapp_invites_public/tables/org_invites/indexes/org_invites_invite_valid_idx


SELECT verify_index('myapp_invites_public.org_invites', 'org_invites_invite_valid_idx');


