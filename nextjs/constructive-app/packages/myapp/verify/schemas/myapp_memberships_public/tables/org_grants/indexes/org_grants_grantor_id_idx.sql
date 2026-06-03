-- Verify: schemas/myapp_memberships_public/tables/org_grants/indexes/org_grants_grantor_id_idx


SELECT verify_index('myapp_memberships_public.org_grants', 'org_grants_grantor_id_idx');


