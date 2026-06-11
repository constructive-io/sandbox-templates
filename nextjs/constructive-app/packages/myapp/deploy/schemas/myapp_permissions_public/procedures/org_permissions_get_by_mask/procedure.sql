-- Deploy: schemas/myapp_permissions_public/procedures/org_permissions_get_by_mask/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


CREATE FUNCTION myapp_permissions_public.org_permissions_get_by_mask(
  mask bit varying
) RETURNS SETOF myapp_permissions_public.org_permissions AS $_PGFN_$
SELECT *
FROM myapp_permissions_public.org_permissions
WHERE
  (bitstr & myapp_permissions_public.org_permissions_get_padded_mask(mask)) = bitstr
$_PGFN_$ LANGUAGE sql STABLE SECURITY INVOKER;

