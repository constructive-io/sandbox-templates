-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/email/alterations/alt0000001503
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/email/column


COMMENT ON COLUMN myapp_invites_public.app_invites.email IS E'Email address of the invited recipient (required when channel=email)';

