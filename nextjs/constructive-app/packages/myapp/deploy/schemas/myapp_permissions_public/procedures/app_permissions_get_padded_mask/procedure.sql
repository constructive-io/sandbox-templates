-- Deploy: schemas/myapp_permissions_public/procedures/app_permissions_get_padded_mask/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema


CREATE FUNCTION myapp_permissions_public.app_permissions_get_padded_mask(
  mask bit varying
) RETURNS bit varying AS $_PGFN_$
SELECT utils.bitmask_pad(mask, 64, '0')
$_PGFN_$ LANGUAGE sql IMMUTABLE SECURITY INVOKER;

