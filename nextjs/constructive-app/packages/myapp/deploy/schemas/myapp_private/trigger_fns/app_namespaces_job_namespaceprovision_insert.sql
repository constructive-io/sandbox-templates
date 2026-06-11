-- Deploy: schemas/myapp_private/trigger_fns/app_namespaces_job_namespaceprovision_insert
-- made with <3 @ constructive.io

-- requires: schemas/myapp_private/schema


CREATE FUNCTION myapp_private.app_namespaces_job_namespaceprovision_insert() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  PERFORM app_jobs.add_job(identifier:='namespace:provision', payload:=json_build_object('id', NEW.id::text), queue_name:='default', max_attempts:=25, priority:=0);
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

