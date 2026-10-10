import CreateJobForm from "@/components/create-job-form";
import { getJobTemplates } from "@/actions/get-job-templates";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create New Job" };

export default async function NewJobPage() {
  const templates = await getJobTemplates();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 className="page-title">Create Job Description</h1>
      <p className="page-subtitle">Post a new job opening using custom text or a preset template</p>
      
      <div className="glass" style={{ padding: 24, borderRadius: 16, marginTop: 20 }}>
        <CreateJobForm templates={templates} />
      </div>
    </div>
  );
}
