import Link from "next/link";
import { getJobTemplates } from "@/actions/get-job-templates";
import CreateJobWorkspace from "@/components/create-job-workspace";
import Icon from "@/components/icon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create job" };

export default async function NewJobPage() {
  let templates: Array<{ id?: string; name?: string; content?: string; [key: string]: unknown }> = [];
  try {
    templates = await getJobTemplates() as typeof templates;
  } catch {
    // Templates are optional. Job creation remains available if they cannot be loaded.
  }

  return (
    <div className="workspace-page create-job-page">
      <Link href="/jobs" className="back-link"><Icon name="arrow-left" size={15} /> Back to jobs</Link>
      <div className="page-heading-row create-job-page-heading">
        <div><p className="eyebrow">Workspace / Jobs / New</p><h1 className="page-title">Create a job</h1><p className="page-subtitle">Start with a job description, a URL, or an existing specification. You can review the extracted requirements next.</p></div>
      </div>
      <CreateJobWorkspace templates={templates} />
    </div>
  );
}
