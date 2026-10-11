SET local check_function_bodies = off;

CREATE EXTENSION "vector" SCHEMA "public";

CREATE TABLE "public"."candidate_matches" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "job_id"              uuid                     NOT NULL,
  "candidate_id"        uuid                     NOT NULL,
  "final_score"         numeric,
  "grade"               text,
  "recommendation"      text,
  "skill_score"         numeric,
  "experience_score"    numeric,
  "education_score"     numeric,
  "bonus_score"         numeric,
  "leadership_score"    numeric,
  "communication_score" numeric,
  "domain_score"        numeric,
  "certification_score" numeric,
  "industry_score"      numeric,
  "matched_skills"      jsonb                    DEFAULT '[]'::jsonb,
  "missing_skills"      jsonb                    DEFAULT '[]'::jsonb,
  "strengths"           jsonb                    DEFAULT '[]'::jsonb,
  "weaknesses"          jsonb                    DEFAULT '[]'::jsonb,
  "explanation"         jsonb                    DEFAULT '{}'::jsonb,
  "created_at"          timestamp with time zone DEFAULT now(),
  "growth_score"        numeric,
  "adaptability_score"  numeric,
  "behavioral_signals"  jsonb                    DEFAULT '[]'::jsonb,
  "implicit_skills"     jsonb                    DEFAULT '[]'::jsonb,
  "risk_score"          numeric,
  "startup_fit"         numeric,
  "enterprise_fit"      numeric,
  "remote_fit"          numeric,
  "leadership_fit"      numeric,
  "recommendations"     jsonb,
  "risk_assessment"     jsonb,
  CONSTRAINT "candidate_matches_pkey" PRIMARY KEY (id),
  CONSTRAINT "unique_job_candidate" UNIQUE (job_id, candidate_id)
);

ALTER TABLE "public"."candidate_matches"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."candidates" (
  "id"                          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id"             uuid                     NOT NULL,
  "full_name"                   text,
  "email"                       text,
  "phone"                       text,
  "resume_storage_path"         text,
  "resume_file_name"            text,
  "source"                      text                     DEFAULT 'upload'::text,
  "status"                      text                     DEFAULT 'new'::text,
  "created_at"                  timestamp with time zone DEFAULT now(),
  "resume_text"                 text,
  "parsed_name"                 text,
  "parsed_email"                text,
  "parsed_phone"                text,
  "parsed_skills"               text[],
  "parsed_linkedin"             text,
  "parsed_github"               text,
  "parsed_portfolio"            text,
  "parsed_degrees"              jsonb                    DEFAULT '[]'::jsonb,
  "parsed_graduation_years"     jsonb                    DEFAULT '[]'::jsonb,
  "parsed_designations"         jsonb                    DEFAULT '[]'::jsonb,
  "parsed_projects"             jsonb                    DEFAULT '[]'::jsonb,
  "parsed_certifications"       jsonb                    DEFAULT '[]'::jsonb,
  "parsed_achievements"         jsonb                    DEFAULT '[]'::jsonb,
  "parsed_summary"              text,
  "parsed_experience_years"     numeric,
  "parsed_location"             text,
  "parsed_universities"         jsonb                    DEFAULT '[]'::jsonb,
  "parsed_cgpa"                 numeric,
  "parsed_companies"            jsonb                    DEFAULT '[]'::jsonb,
  "parsed_employment_duration"  jsonb                    DEFAULT '[]'::jsonb,
  "parsed_employment_gaps"      jsonb                    DEFAULT '[]'::jsonb,
  "parsed_leadership_signals"   jsonb                    DEFAULT '[]'::jsonb,
  "parsed_project_technologies" jsonb                    DEFAULT '[]'::jsonb,
  "parsed_project_impacts"      jsonb                    DEFAULT '[]'::jsonb,
  "parsed_publications"         jsonb                    DEFAULT '[]'::jsonb,
  "parsed_open_source"          jsonb                    DEFAULT '[]'::jsonb,
  "behavioral_signals"          jsonb                    DEFAULT '[]'::jsonb,
  "inferred_skills"             jsonb                    DEFAULT '[]'::jsonb,
  "adaptability_score"          numeric,
  "growth_score"                numeric,
  "candidate_graph"             jsonb                    DEFAULT '{}'::jsonb,
  "embedding"                   public.vector(1024),
  CONSTRAINT "candidates_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."candidates"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."job_analysis" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "job_id"                  uuid,
  "required_skills"         jsonb,
  "preferred_skills"        jsonb,
  "experience_requirements" jsonb,
  "education_requirements"  jsonb,
  "certifications"          jsonb,
  "must_have"               jsonb,
  "nice_to_have"            jsonb,
  "seniority"               text,
  "industry"                text,
  "domain"                  text,
  "technologies"            jsonb,
  "tools"                   jsonb,
  "soft_skills"             jsonb,
  "readability_score"       numeric,
  "created_at"              timestamp with time zone DEFAULT now(),
  "responsibilities"        jsonb                    DEFAULT '[]'::jsonb,
  "keywords"                jsonb                    DEFAULT '[]'::jsonb,
  "hidden_requirements"     jsonb                    DEFAULT '[]'::jsonb,
  "semantic_requirements"   jsonb                    DEFAULT '[]'::jsonb,
  "missing_requirements"    jsonb                    DEFAULT '[]'::jsonb,
  "duplicate_requirements"  jsonb                    DEFAULT '[]'::jsonb,
  "skill_gaps"              jsonb                    DEFAULT '[]'::jsonb,
  "salary_benchmark"        jsonb                    DEFAULT '{}'::jsonb,
  CONSTRAINT "job_analysis_pkey" PRIMARY KEY (id),
  CONSTRAINT "unique_job_analysis" UNIQUE (job_id)
);

ALTER TABLE "public"."job_analysis"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."job_templates" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "description" text,
  "content"     text                     NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "job_templates_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."job_templates"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."job_versions" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "job_id"         uuid,
  "version_number" integer                  NOT NULL,
  "content"        text                     NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "job_versions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."job_versions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."jobs" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid,
  "title"           text                     NOT NULL,
  "status"          text                     DEFAULT 'draft'::text,
  "current_version" integer                  DEFAULT 1,
  "created_by"      uuid,
  "created_at"      timestamp with time zone DEFAULT now(),
  "updated_at"      timestamp with time zone DEFAULT now(),
  "content"         text,
  "jd_storage_path" text,
  "jd_file_name"    text,
  "source"          text                     DEFAULT 'manual'::text,
  CONSTRAINT "jobs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."jobs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."memberships" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid,
  "organization_id" uuid,
  "role"            text                     NOT NULL,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "memberships_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."memberships"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organizations" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "slug"       text                     NOT NULL,
  "logo_url"   text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "organizations_pkey" PRIMARY KEY (id),
  CONSTRAINT "organizations_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."organizations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."taxonomy_aliases" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "taxonomy_id" uuid                     NOT NULL,
  "alias"       text                     NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "taxonomy_aliases_pkey" PRIMARY KEY (id),
  CONSTRAINT "uq_taxonomy_alias" UNIQUE (alias)
);

ALTER TABLE "public"."taxonomy_aliases"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."taxonomy_entities" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "canonical_name" text                     NOT NULL,
  "entity_type"    text                     NOT NULL,
  "category"       text,
  "parent_id"      uuid,
  "description"    text,
  "metadata"       jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "taxonomy_entities_pkey" PRIMARY KEY (id),
  CONSTRAINT "uq_taxonomy_entity" UNIQUE (canonical_name, entity_type)
);

ALTER TABLE "public"."taxonomy_entities"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "clerk_user_id" text                     NOT NULL,
  "email"         text                     NOT NULL,
  "full_name"     text,
  "avatar_url"    text,
  "created_at"    timestamp with time zone DEFAULT now(),
  "updated_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "users_clerk_user_id_key" UNIQUE (clerk_user_id),
  CONSTRAINT "users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$function$;

ALTER TABLE "public"."candidate_matches"
  ADD CONSTRAINT "candidate_matches_candidate_id_fkey" FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

ALTER TABLE "public"."candidate_matches"
  ADD CONSTRAINT "candidate_matches_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE "public"."job_analysis"
  ADD CONSTRAINT "job_analysis_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE "public"."job_versions"
  ADD CONSTRAINT "job_versions_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE "public"."candidates"
  ADD CONSTRAINT "candidates_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."jobs"
  ADD CONSTRAINT "jobs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."memberships"
  ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."taxonomy_aliases"
  ADD CONSTRAINT "taxonomy_aliases_taxonomy_id_fkey" FOREIGN KEY (taxonomy_id) REFERENCES public.taxonomy_entities(id) ON DELETE CASCADE;

ALTER TABLE "public"."taxonomy_entities"
  ADD CONSTRAINT "taxonomy_entities_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.taxonomy_entities(id) ON DELETE SET NULL;

ALTER TABLE "public"."jobs"
  ADD CONSTRAINT "jobs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE "public"."memberships"
  ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX idx_taxonomy_alias ON public.taxonomy_aliases USING btree (alias);

CREATE INDEX idx_taxonomy_entity_name ON public.taxonomy_entities USING btree (canonical_name);

CREATE INDEX idx_taxonomy_entity_type ON public.taxonomy_entities USING btree (entity_type);

CREATE INDEX idx_taxonomy_parent ON public.taxonomy_entities USING btree (parent_id);

CREATE TRIGGER taxonomy_entities_updated_at
  BEFORE UPDATE ON public.taxonomy_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "dev_full_access" ON "public"."candidate_matches"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."candidates"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."job_analysis"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."job_templates"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."job_versions"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."jobs"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_users_full_access" ON "public"."memberships"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_users_full_access" ON "public"."organizations"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."taxonomy_aliases"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_full_access" ON "public"."taxonomy_entities"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_users_full_access" ON "public"."users"
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_delete i5g8va_0" ON "storage"."objects"
  FOR DELETE
  TO PUBLIC
  USING (true);

CREATE POLICY "dev_delete i5g8va_1" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "dev_insert i5g8va_0" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "dev_select i5g8va_0" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "dev_update i5g8va_0" ON "storage"."objects"
  FOR UPDATE
  TO PUBLIC
  USING (true);

CREATE POLICY "dev_update i5g8va_1" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING (true);

COMMENT ON EXTENSION "vector" IS 'vector data type and ivfflat and hnsw access methods';

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."candidate_matches" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."candidate_matches" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."candidate_matches" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."candidate_matches" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."candidates" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."candidates" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."candidates" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."candidates" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_analysis" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."job_analysis" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_analysis" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_analysis" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_templates" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."job_templates" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_templates" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_templates" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_versions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."job_versions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_versions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_versions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."jobs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."memberships" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."memberships" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."memberships" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."memberships" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."organizations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."taxonomy_aliases" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."taxonomy_aliases" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."taxonomy_aliases" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."taxonomy_aliases" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."taxonomy_entities" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."taxonomy_entities" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."taxonomy_entities" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."taxonomy_entities" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "service_role";