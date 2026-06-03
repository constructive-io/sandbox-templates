-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/created_at/alterations/alt0000000991


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN created_at DROP DEFAULT;


