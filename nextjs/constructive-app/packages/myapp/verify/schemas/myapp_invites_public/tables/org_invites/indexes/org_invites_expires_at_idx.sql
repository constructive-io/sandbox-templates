-- Verify: schemas/myapp_invites_public/tables/org_invites/indexes/org_invites_expires_at_idx


SELECT verify_index('myapp_invites_public.org_invites', 'org_invites_expires_at_idx');


