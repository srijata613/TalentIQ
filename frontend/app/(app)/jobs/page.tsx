import Link from "next/link";
import { getJobs } from "@/actions/get-jobs";
import JobsDirectory from "@/components/jobs-directory";
import Icon from "@/components/icon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Jobs" };

export default async function JobsPage() {
  const jobs = (await getJobs()) as Array<{
    id: string;
    title: string | null;
    status: string | null;
    created_at: string | null;
    updated_at?: string | null;
  }>;
  const openJobs = jobs.filter((job) => ["active", "open"].includes((job.status || "").toLowerCase())).length;
  const draftJobs = jobs.filter((job) => (job.status || "draft").toLowerCase() === "draft").length;

  return (
    <div className="workspace-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">Workspace / Hiring</p>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">Manage roles, understand their requirements, and find the right candidates.</p>
        </div>
        <div className="page-heading-actions">
          <Link href="/jobs/upload" className="btn btn-secondary"><Icon name="upload" size={15} /> Upload job PDF</Link>
          <Link href="/jobs/new" className="btn btn-primary"><Icon name="plus" size={15} /> Create job</Link>
        </div>
      </div>

      <div className="jobs-overview-strip">
        <div className="jobs-overview-item"><span className="jobs-overview-icon"><Icon name="briefcase" size={17} /></span><span><small>Total roles</small><strong>{jobs.length}</strong></span></div>
        <div className="jobs-overview-divider" />
        <div className="jobs-overview-item"><span className="jobs-overview-icon"><Icon name="activity" size={17} /></span><span><small>Active or open</small><strong>{openJobs}</strong></span></div>
        <div className="jobs-overview-divider" />
        <div className="jobs-overview-item"><span className="jobs-overview-icon"><Icon name="clock" size={17} /></span><span><small>Drafts</small><strong>{draftJobs}</strong></span></div>
        <div className="jobs-overview-copy"><Icon name="sparkles" size={15} /><span>Job analysis and candidate matching are available inside each role.</span></div>
      </div>

      <JobsDirectory jobs={jobs} />
    </div>
  );
}
