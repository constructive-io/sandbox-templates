-- Verify: schemas/myapp_memberships_public/tables/org_admin_grants/indexes/org_admin_grants_grantor_id_idx


SELECT verify_index('myapp_memberships_public.org_admin_grants', 'org_admin_grants_grantor_id_idx');


