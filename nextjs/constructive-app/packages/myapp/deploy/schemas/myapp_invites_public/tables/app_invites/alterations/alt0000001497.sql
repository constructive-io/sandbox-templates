-- Deploy: schemas/myapp_invites_public/tables/app_invites/alterations/alt0000001497
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


COMMENT ON TABLE myapp_invites_public.app_invites IS E'Invitation records sent to prospective members via email, with token-based redemption and expiration';

