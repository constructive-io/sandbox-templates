-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/alterations/alt0000001487
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table


COMMENT ON TABLE myapp_invites_public.app_claimed_invites IS E'Records of successfully claimed invitations, linking senders to receivers';

