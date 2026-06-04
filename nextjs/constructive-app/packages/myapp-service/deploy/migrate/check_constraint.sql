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
  ('019e917c-c78f-70f2-a90e-8f227ec62101', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_username_chk', 'c', '{019e917c-c78c-70ae-b71d-036e3e7248b8}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"FuncCall":{"args":[{"ColumnRef":{"fields":[{"String":{"sval":"username"}}]}}],"funcname":[{"String":{"sval":"character_length"}}]}},"rexpr":{"A_Const":{"ival":256}}}}'),
  ('019e917c-c798-7c55-9af3-fa07d16c8790', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_display_name_chk', 'c', '{019e917c-c796-7b46-9ed6-1981c20ac50a}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"FuncCall":{"args":[{"ColumnRef":{"fields":[{"String":{"sval":"display_name"}}]}}],"funcname":[{"String":{"sval":"character_length"}}]}},"rexpr":{"A_Const":{"ival":256}}}}'),
  ('019e917c-c88d-7b03-87d8-9ab5bd5625e1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c86e-7965-813c-c19099a78a80', 'app_permissions_bitnum_chk', 'c', '{019e917c-c88b-75b2-ad7a-772881c84fc5}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":">="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":1}}}},{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":64}}}}],"boolop":"AND_EXPR"}}'),
  ('019e917c-d941-78f9-b4c2-79aaadae2ef8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d90f-71bb-84f8-6e668302c9af', 'org_permissions_bitnum_chk', 'c', '{019e917c-d93d-76a5-ab6a-69bcfd1d56d1}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":">="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":1}}}},{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":64}}}}],"boolop":"AND_EXPR"}}'),
  ('019e917c-f5b8-7357-bc0b-fb69dd667954', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f4f2-7415-82e3-1b38f0540eb3', 'org_chart_edges_child_id_parent_id_chk', 'c', '{019e917c-f558-71e0-b943-d708bd673bd8,019e917c-f570-74b9-930e-3a9179d592cd}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"child_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"parent_id"}}]}}}}'),
  ('019e917d-076e-711e-a75f-9d6e1b080a7c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0681-7994-aafe-ce0599f61fc6', 'app_namespace_events_event_type_chk', 'c', '{019e917d-06d0-7447-8ae8-fcd812e46cb8}', '{"A_Expr":{"kind":"AEXPR_IN","name":[{"String":{"sval":"="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"event_type"}}]}},"rexpr":[{"A_Const":{"sval":"created"}},{"A_Const":{"sval":"activated"}},{"A_Const":{"sval":"deactivated"}},{"A_Const":{"sval":"labels_updated"}},{"A_Const":{"sval":"annotations_updated"}},{"A_Const":{"sval":"renamed"}},{"A_Const":{"sval":"deleted"}},{"A_Const":{"sval":"metrics_snapshot"}},{"A_Const":{"sval":"scaled"}},{"A_Const":{"sval":"quota_exceeded"}},{"A_Const":{"sval":"resource_warning"}}]}}'),
  ('019e917d-1450-7db5-973f-ccc007c7aa4d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1387-7eaf-b9a0-a3258a40e55c', 'app_claimed_invites_sender_id_receiver_id_chk', 'c', '{019e917d-13d0-7cb6-b324-282c2e6f9775,019e917d-13df-7e39-8942-d844ee521196}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"sender_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"receiver_id"}}]}}}}'),
  ('019e917d-17e1-7ae5-a2f0-a6e005e2ff06', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1723-7668-9617-7d7873aac9cf', 'org_claimed_invites_sender_id_receiver_id_chk', 'c', '{019e917d-176c-723b-8ff0-16219bd5b4c8,019e917d-177a-760b-ae0b-0f656151ad45}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"sender_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"receiver_id"}}]}}}}');


SET session_replication_role TO DEFAULT;


