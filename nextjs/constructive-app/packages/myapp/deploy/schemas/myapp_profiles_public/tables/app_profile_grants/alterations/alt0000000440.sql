-- Deploy: schemas/myapp_profiles_public/tables/app_profile_grants/alterations/alt0000000440
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/table


COMMENT ON TABLE myapp_profiles_public.app_profile_grants IS 'Audit log of profile assignments and revocations for members';

