-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/invite_limit/alterations/alt0000001516
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/invite_limit/column


COMMENT ON COLUMN myapp_invites_public.app_invites.invite_limit IS E'Maximum number of times this invite can be claimed; -1 means unlimited';

