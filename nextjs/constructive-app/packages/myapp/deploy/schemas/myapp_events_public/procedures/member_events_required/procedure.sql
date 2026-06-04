-- Deploy: schemas/myapp_events_public/procedures/member_events_required/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


CREATE FUNCTION myapp_events_public.member_events_required(
  IN level text,
  IN entity_id uuid,
  IN role_id uuid
) RETURNS SETOF myapp_events_public.org_level_requirements AS $_PGFN_$
BEGIN
  RETURN QUERY SELECT
    org_level_requirements.id,
    org_level_requirements.name,
    org_level_requirements.level,
    org_level_requirements.description,
    (0 - 1) * (coalesce(org_event_aggregates.count, 0) - org_level_requirements.required_count) AS required_count,
    org_level_requirements.priority,
    org_level_requirements.entity_id,
    org_level_requirements.created_at,
    org_level_requirements.updated_at
  FROM myapp_events_public.org_level_requirements FULL OUTER JOIN myapp_events_public.org_event_aggregates ON (org_event_aggregates.name = org_level_requirements.name AND org_event_aggregates.actor_id = member_events_required.role_id) AND org_event_aggregates.entity_id = member_events_required.entity_id INNER JOIN myapp_events_public.org_levels ON org_level_requirements.level = org_levels.name AND org_level_requirements.entity_id = org_levels.entity_id
  WHERE
    (org_level_requirements.level = member_events_required.level AND org_level_requirements.entity_id = member_events_required.entity_id) AND ((0 - 1) * (coalesce(org_event_aggregates.count, 0) - org_level_requirements.required_count)) > 0
  ORDER BY
    priority ASC;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

