-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/triggers/trigger_name_verified_guard
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_private/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_private/trigger_fns/emails_insert_tg_verified_guard


CREATE TRIGGER trigger_name_verified_guard
BEFORE UPDATE ON myapp_user_identifiers_public.emails
FOR EACH ROW
WHEN (OLD.is_primary IS DISTINCT FROM NEW.is_primary)
EXECUTE PROCEDURE myapp_user_identifiers_private.emails_insert_tg_verified_guard ( );

