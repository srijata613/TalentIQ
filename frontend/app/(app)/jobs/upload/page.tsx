import UploadJobPdfForm from "@/components/upload-job-pdf-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Upload Job Description" };

export default function UploadJobPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 className="page-title">Upload Job Description</h1>
      <p className="page-subtitle">Upload a job spec document (PDF) to create a new job posting</p>

      <div className="glass" style={{ padding: 24, borderRadius: 16, marginTop: 20 }}>
        <UploadJobPdfForm />
      </div>
    </div>
  );
}
