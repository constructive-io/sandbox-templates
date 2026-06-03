-- Verify: schemas/myapp_memberships_public/tables/app_memberships/indexes/app_memberships_profile_id_idx


SELECT verify_index('myapp_memberships_public.app_memberships', 'app_memberships_profile_id_idx');


