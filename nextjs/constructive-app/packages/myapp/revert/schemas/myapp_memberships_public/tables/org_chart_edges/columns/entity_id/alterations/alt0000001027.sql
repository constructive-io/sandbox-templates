-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/entity_id/alterations/alt0000001027


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN entity_id DROP NOT NULL;


