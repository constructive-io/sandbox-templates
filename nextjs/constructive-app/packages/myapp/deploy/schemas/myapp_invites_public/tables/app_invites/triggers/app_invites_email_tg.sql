-- Deploy: schemas/myapp_invites_public/tables/app_invites/triggers/app_invites_email_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_private/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_private/trigger_fns/app_invites_insert_before_tg


CREATE TRIGGER app_invites_email_tg
BEFORE INSERT ON myapp_invites_public.app_invites
FOR EACH ROW
EXECUTE PROCEDURE myapp_invites_private.app_invites_insert_before_tg ( );

