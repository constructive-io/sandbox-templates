-- Verify: schemas/myapp_memberships_public/tables/app_owner_grants/indexes/app_owner_grants_grantor_id_idx


SELECT verify_index('myapp_memberships_public.app_owner_grants', 'app_owner_grants_grantor_id_idx');


