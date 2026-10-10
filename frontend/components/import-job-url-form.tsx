"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { importJobUrl } from "@/actions/import-job-url";
import Icon from "@/components/icon";

export default function ImportJobUrlForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const job = await importJobUrl(title.trim(), url.trim());
      router.push(`/jobs/${job.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import this job page.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="create-job-form" onSubmit={handleImport}>
      <div><label className="form-label" htmlFor="import-job-title">Job title <span className="required-indicator">*</span></label><input id="import-job-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Senior ML Engineer" className="form-input" required /></div>
      <div><label className="form-label" htmlFor="import-job-url">Public job URL <span className="required-indicator">*</span></label><input id="import-job-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://company.com/careers/job-title" className="form-input" required /><p className="field-hint">The page must be publicly accessible for content extraction.</p></div>
      {error && <div role="alert" className="form-error"><Icon name="x" size={15} />{error}</div>}
      <div className="form-submit-row"><span className="form-submit-note"><Icon name="shield-check" size={14} /> The imported content will be saved to your workspace</span><button type="submit" disabled={loading || !title.trim() || !url.trim()} className="btn btn-primary btn-lg">{loading ? <><span className="loading-spinner" /> Importing…</> : <>Import job <Icon name="arrow-right" size={15} /></>}</button></div>
    </form>
  );
}
