-- Verify: schemas/myapp_memberships_public/tables/app_admin_grants/indexes/app_admin_grants_actor_id_idx


SELECT verify_index('myapp_memberships_public.app_admin_grants', 'app_admin_grants_actor_id_idx');


