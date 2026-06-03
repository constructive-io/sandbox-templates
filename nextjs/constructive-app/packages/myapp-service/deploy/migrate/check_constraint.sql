-- Deploy: migrate/check_constraint
-- made with <3 @ constructive.io

-- requires: migrate/unique_constraint


SET session_replication_role TO replica;
-- using replica in case we are deploying triggers to metaschema_public

-- unaccent, postgis affected and require grants
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

DO $LQLMIGRATION$
  DECLARE
  BEGIN

    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

  END;
$LQLMIGRATION$;

INSERT INTO metaschema_public.check_constraint (
  id,
  database_id,
  table_id,
  name,
  type,
  field_ids,
  expr
) VALUES
  ('019e8c61-4a42-7d78-ae39-559d68457b9a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_username_chk', 'c', '{019e8c61-4a3f-7dee-9a11-4493f059432d}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"FuncCall":{"args":[{"ColumnRef":{"fields":[{"String":{"sval":"username"}}]}}],"funcname":[{"String":{"sval":"character_length"}}]}},"rexpr":{"A_Const":{"ival":256}}}}'),
  ('019e8c61-4a4c-78a0-9979-fc517251c8fe', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_display_name_chk', 'c', '{019e8c61-4a4a-7721-a1ef-ef01ae872c87}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"FuncCall":{"args":[{"ColumnRef":{"fields":[{"String":{"sval":"display_name"}}]}}],"funcname":[{"String":{"sval":"character_length"}}]}},"rexpr":{"A_Const":{"ival":256}}}}'),
  ('019e8c61-4b53-7b02-9fe3-a656eb48298f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b2f-7ad3-a010-1dcc0f3134fb', 'app_permissions_bitnum_chk', 'c', '{019e8c61-4b50-7963-87a8-1bacc8556467}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":">="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":1}}}},{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":64}}}}],"boolop":"AND_EXPR"}}'),
  ('019e8c61-5d66-7909-bfc8-5fbdc53da1db', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5d29-7de0-981d-5a7f07ee34b9', 'org_permissions_bitnum_chk', 'c', '{019e8c61-5d62-700b-a360-2b268fb2fc3d}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":">="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":1}}}},{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":64}}}}],"boolop":"AND_EXPR"}}'),
  ('019e8c61-7c45-727e-9ab3-c1c7bc005d54', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', 'org_chart_edges_child_id_parent_id_chk', 'c', '{019e8c61-7be0-7aff-9c9d-5ebc494ce462,019e8c61-7bfb-7222-8e6f-85641aebbd0a}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"child_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"parent_id"}}]}}}}'),
  ('019e8c61-8ec7-7ec3-8af0-d6fa80f11ba5', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8dd1-7ea4-b9c5-8758daeb1446', 'app_namespace_events_event_type_chk', 'c', '{019e8c61-8e24-7276-b685-6f1d0eee98ca}', '{"A_Expr":{"kind":"AEXPR_IN","name":[{"String":{"sval":"="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"event_type"}}]}},"rexpr":[{"A_Const":{"sval":"created"}},{"A_Const":{"sval":"activated"}},{"A_Const":{"sval":"deactivated"}},{"A_Const":{"sval":"labels_updated"}},{"A_Const":{"sval":"annotations_updated"}},{"A_Const":{"sval":"renamed"}},{"A_Const":{"sval":"deleted"}},{"A_Const":{"sval":"metrics_snapshot"}},{"A_Const":{"sval":"scaled"}},{"A_Const":{"sval":"quota_exceeded"}},{"A_Const":{"sval":"resource_warning"}}]}}'),
  ('019e8c61-9cd9-75bf-9918-6628e8285431', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9c07-7804-ad65-589cba79f737', 'app_claimed_invites_sender_id_receiver_id_chk', 'c', '{019e8c61-9c61-75d3-a78d-a62103c3a76b,019e8c61-9c71-7448-a954-8e407e4e1427}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"sender_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"receiver_id"}}]}}}}'),
  ('019e8c61-a09f-702f-b0d5-97a8ce39de94', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9fcc-7296-8afa-7b85b7ea7212', 'org_claimed_invites_sender_id_receiver_id_chk', 'c', '{019e8c61-a027-785d-baf1-50622056ab75,019e8c61-a036-749f-b760-f0305a635404}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"sender_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"receiver_id"}}]}}}}');


SET session_replication_role TO DEFAULT;


