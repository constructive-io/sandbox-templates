-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/profile_id/alterations/alt0000001524
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/profile_id/column


COMMENT ON COLUMN myapp_invites_public.app_invites.profile_id IS E'Optional profile (role) to assign to the member when they claim this invite. Only allowed on email invites.';

