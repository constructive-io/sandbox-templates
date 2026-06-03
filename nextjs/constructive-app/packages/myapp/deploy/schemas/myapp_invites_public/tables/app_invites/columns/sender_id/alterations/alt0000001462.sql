-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/sender_id/alterations/alt0000001462
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/sender_id/column


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN sender_id SET DEFAULT jwt_public.current_user_id();

