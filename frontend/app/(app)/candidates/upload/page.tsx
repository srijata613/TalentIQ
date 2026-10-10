import UploadResumeForm from "@/components/upload-resume-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Upload Candidate Resume" };

export default function UploadCandidatePage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 className="page-title">Upload Resume</h1>
      <p className="page-subtitle">Upload a candidate resume PDF to store in your talent database</p>
      
      <div className="glass" style={{ padding: 24, borderRadius: 16, marginTop: 20 }}>
        <UploadResumeForm />
      </div>
    </div>
  );
}
