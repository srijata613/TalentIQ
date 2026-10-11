"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { createJobFromPdf } from "@/actions/create-job-from-pdf";
import Icon from "@/components/icon";

export default function UploadJobPdfForm() {
  const router = useRouter();
  const supabaseBrowser = useSupabaseBrowser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (
      selected &&
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Choose a PDF file to continue.");
      setFile(null);
      return;
    }

    if (selected && selected.size > 20 * 1024 * 1024) {
      setError("The PDF must be 20 MB or smaller.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  }

  async function handleUpload() {
    if (!file || loading) return;

    setError("");

    try {
      setLoading(true);

      // Resolve the user's organization before uploading.
      const {
        data: organizationId,
        error: organizationError,
      } = await supabaseBrowser.rpc("current_app_organization_id");

      if (organizationError || !organizationId) {
        throw new Error("Unable to determine your organization.");
      }

      const safeFileName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const storagePath =
        `${organizationId}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from("job-descriptions")
        .upload(storagePath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const title = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[_-]+/g, " ")
        .trim();

      const job = await createJobFromPdf(
        title || "Untitled job",
        storagePath,
        file.name
      );

      router.push(`/jobs/${job.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-job-form">
      <div>
        <span className="form-label">
          Job specification PDF{" "}
          <span className="required-indicator">*</span>
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          className="visually-hidden"
          aria-label="Choose job specification PDF"
        />

        <button
          type="button"
          className={`upload-dropzone${file ? " has-file" : ""}`}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <span className="upload-dropzone-icon">
            <Icon name={file ? "file-check" : "upload"} size={23} />
          </span>

          <strong>
            {file ? file.name : "Choose a PDF to upload"}
          </strong>

          <span>
            {file
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload`
              : "PDF files up to 20 MB"}
          </span>

          <span className="btn btn-secondary btn-sm">
            Browse files
          </span>
        </button>
      </div>

      {error && (
        <div role="alert" className="form-error">
          <Icon name="x" size={15} />
          {error}
        </div>
      )}

      <div className="form-submit-row">
        <span className="form-submit-note">
          <Icon name="shield-check" size={14} />
          Stored in your job workspace
        </span>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="btn btn-primary btn-lg"
        >
          {loading ? (
            <>
              <span className="loading-spinner" />
              Uploading…
            </>
          ) : (
            <>
              Upload and create
              <Icon name="arrow-right" size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}