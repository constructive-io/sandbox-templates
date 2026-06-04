-- Verify: schemas/myapp_memberships_public/tables/org_member_profiles/indexes/org_member_profiles_updated_at_idx


SELECT verify_index('myapp_memberships_public.org_member_profiles', 'org_member_profiles_updated_at_idx');


