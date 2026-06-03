-- Verify: schemas/myapp_invites_public/tables/app_invites/indexes/app_invites_invite_valid_idx


SELECT verify_index('myapp_invites_public.app_invites', 'app_invites_invite_valid_idx');


