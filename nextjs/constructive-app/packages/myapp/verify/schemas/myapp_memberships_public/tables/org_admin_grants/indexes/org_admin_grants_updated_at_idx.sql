-- Verify: schemas/myapp_memberships_public/tables/org_admin_grants/indexes/org_admin_grants_updated_at_idx


SELECT verify_index('myapp_memberships_public.org_admin_grants', 'org_admin_grants_updated_at_idx');


