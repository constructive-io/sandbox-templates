-- Verify: schemas/myapp_invites_public/tables/app_claimed_invites/indexes/app_claimed_invites_updated_at_idx


SELECT verify_index('myapp_invites_public.app_claimed_invites', 'app_claimed_invites_updated_at_idx');


