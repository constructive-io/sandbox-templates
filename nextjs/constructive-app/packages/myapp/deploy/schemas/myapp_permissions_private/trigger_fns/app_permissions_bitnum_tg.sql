-- Deploy: schemas/myapp_permissions_private/trigger_fns/app_permissions_bitnum_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_private/schema


CREATE FUNCTION myapp_permissions_private.app_permissions_bitnum_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  bitlen int := bit_length(NEW.bitstr);
BEGIN
  NEW.bitstr := (lpad('', bitlen - NEW.bitnum, '0') || '1') || lpad('', NEW.bitnum - 1, '0');
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER;

