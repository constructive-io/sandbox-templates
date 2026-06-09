-- Deploy: schemas/myapp_invites_private/trigger_fns/app_invites_insert_before_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_private/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


CREATE FUNCTION myapp_invites_private.app_invites_insert_before_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  email_exists boolean;
BEGIN
  IF NEW.channel = 'email' AND NEW.email IS NOT NULL THEN
    SELECT
      EXISTS (SELECT 1
      FROM myapp_user_identifiers_public.emails AS e
      WHERE
        e.email = NEW.email) INTO email_exists;
    IF email_exists IS TRUE THEN
      RAISE EXCEPTION 'ACCOUNT_EXISTS';
    END IF;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

