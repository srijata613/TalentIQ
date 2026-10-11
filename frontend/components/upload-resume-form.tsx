
"use client";

import { useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { createCandidate } from "@/actions/create-candidate";

export default function UploadResumeForm() {
  const supabaseBrowser = useSupabaseBrowser();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    try {
      setLoading(true);

      // Validate the selected file before uploading.
      if (
        file.type !== "application/pdf" ||
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error("Please select a valid PDF resume.");
      }

      // Resolve the organization associated with the signed-in user.
      const {
        data: organizationId,
        error: organizationError,
      } = await supabaseBrowser.rpc("current_app_organization_id");

      if (organizationError || !organizationId) {
        throw new Error("Unable to determine your organization.");
      }

      // Create a safe, unique path inside the organization's namespace.
      const safeFileName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const storagePath =
        `${organizationId}/${crypto.randomUUID()}-${safeFileName}`;

      // Upload the resume to the private Storage bucket.
      const { error: uploadError } = await supabaseBrowser.storage
        .from("resumes")
        .upload(storagePath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Resume upload failed: ${uploadError.message}`
        );
      }

      // Save the original filename and exact Storage path.
      const candidate = await createCandidate(
        file.name,
        storagePath
      );

      window.location.href = `/candidates/${candidate.id}`;
    } catch (err) {
      console.error("Resume upload failed.");

      alert(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while uploading the resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label className="form-label">
          Select Candidate Resume PDF
        </label>

        <input
          type="file"
          accept=".pdf,application/pdf"
          className="form-input"
          style={{ cursor: "pointer" }}
          disabled={loading}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
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
