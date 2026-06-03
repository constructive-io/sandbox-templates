-- Deploy: schemas/myapp_permissions_public/procedures/org_permissions_get_mask_by_names/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


CREATE FUNCTION myapp_permissions_public.org_permissions_get_mask_by_names(
  names citext[]
) RETURNS bit varying AS $_PGFN_$
SELECT bit_or(bitstr)
FROM myapp_permissions_public.org_permissions
WHERE
  name = ANY( names )
$_PGFN_$ LANGUAGE sql STABLE SECURITY INVOKER;

