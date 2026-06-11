-- Verify: schemas/myapp_invites_public/tables/app_invites/indexes/app_invites_sender_id_idx


SELECT verify_index('myapp_invites_public.app_invites', 'app_invites_sender_id_idx');


