-- Deploy: schemas/myapp_user_identifiers_private/trigger_fns/emails_insert_tg_ensure_primary
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_private/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


CREATE FUNCTION myapp_user_identifiers_private.emails_insert_tg_ensure_primary() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF OLD.is_primary IS TRUE THEN
    IF NOT (EXISTS (SELECT 1
    FROM myapp_user_identifiers_public.emails
    WHERE
      owner_id = OLD.owner_id AND is_primary IS TRUE
    LIMIT
    1)) THEN
      UPDATE myapp_user_identifiers_public.emails SET
      is_primary = true
      WHERE
        ctid = ((SELECT ctid
        FROM myapp_user_identifiers_public.emails
        WHERE
            owner_id = OLD.owner_id AND is_verified IS TRUE
        LIMIT
        1));
    END IF;
  END IF;
  RETURN NULL;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

