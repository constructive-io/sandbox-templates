-- Deploy: schemas/myapp_invites_public/tables/app_invites/constraints/app_invites_invite_token_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


ALTER TABLE myapp_invites_public.app_invites 
  ADD CONSTRAINT app_invites_invite_token_key 
    UNIQUE (invite_token);

