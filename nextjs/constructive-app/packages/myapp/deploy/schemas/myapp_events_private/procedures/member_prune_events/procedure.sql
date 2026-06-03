-- Deploy: schemas/myapp_events_private/procedures/member_prune_events/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_public/tables/org_event_types/table


CREATE FUNCTION myapp_events_private.member_prune_events() RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM myapp_events_public.org_events AS e
  USING
    myapp_events_public.org_event_types AS et
  WHERE
    ((((e.name = et.name AND et.retention_days IS NOT NULL) AND et.retention_days > 0) AND et.is_milestone = false) AND et.is_active = true) AND e.created_at < (pg_catalog.now() - (et.retention_days * '1 day'::interval));
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

