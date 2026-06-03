-- Verify: schemas/myapp_memberships_public/tables/app_memberships/indexes/app_memberships_updated_at_idx


SELECT verify_index('myapp_memberships_public.app_memberships', 'app_memberships_updated_at_idx');


