"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { createCandidate } from "@/actions/create-candidate";

export default function UploadResumeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    try {
      setLoading(true);

      const fileName = `${Date.now()}-${file.name}`;

      const {
        error: uploadError,
      } = await supabaseBrowser.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await supabaseBrowser.storage
        .from("resumes")
        .createSignedUrl(fileName, 60);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw new Error(
          signedUrlError?.message ??
          "Failed to generate signed URL"
        );
      }

      const candidate = await createCandidate(
        file.name,
        fileName
      );

      window.location.href = `/candidates/${candidate.id}`;

    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : JSON.stringify(err)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label className="form-label">Select Candidate Resume PDF</label>
        <input
          type="file"
          accept=".pdf"
          className="form-input"
          style={{ cursor: "pointer" }}
          onChange={(e) =>
            setFile(e.target.files?.[0] ?? null)
          }
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="btn btn-primary"
        >
          {loading ? "Uploading Resume..." : "Upload & Save Candidate"}
        </button>
      </div>
    </div>
  );
}