-- Deploy: schemas/myapp_events_public/procedures/events_required/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table


CREATE FUNCTION myapp_events_public.events_required(
  IN level text,
  IN role_id uuid
) RETURNS SETOF myapp_events_public.app_level_requirements AS $_PGFN_$
BEGIN
  RETURN QUERY SELECT
    app_level_requirements.id,
    app_level_requirements.name,
    app_level_requirements.level,
    app_level_requirements.description,
    (0 - 1) * (coalesce(app_event_aggregates.count, 0) - app_level_requirements.required_count) AS required_count,
    app_level_requirements.priority,
    app_level_requirements.created_at,
    app_level_requirements.updated_at
  FROM myapp_events_public.app_level_requirements FULL OUTER JOIN myapp_events_public.app_event_aggregates ON app_event_aggregates.name = app_level_requirements.name AND app_event_aggregates.actor_id = events_required.role_id INNER JOIN myapp_events_public.app_levels ON app_level_requirements.level = app_levels.name
  WHERE
    app_level_requirements.level = events_required.level AND ((0 - 1) * (coalesce(app_event_aggregates.count, 0) - app_level_requirements.required_count)) > 0
  ORDER BY
    priority ASC;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

