"use client";

import { useState } from "react";

import { supabaseBrowser }
  from "@/lib/supabase-browser";

import {
  createJobFromPdf,
} from "@/actions/create-job-from-pdf";

export default function
UploadJobPdfForm() {

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleUpload() {

    if (!file) return;

    try {

      setLoading(true);

      const storagePath =
        `${Date.now()}-${file.name}`;

      const {
        error: uploadError,
      } =
        await supabaseBrowser
          .storage
          .from(
            "job-descriptions"
          )
          .upload(
            storagePath,
            file
          );

      if (uploadError) {
        throw uploadError;
      }

      const title =
        file.name.replace(
          ".pdf",
          ""
        );

      const job =
        await createJobFromPdf(
          title,
          storagePath,
          file.name
        );

      window.location.href =
        `/jobs/${job.id}`;

    } catch (err) {

      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="space-y-4">

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files?.[0]
            ?? null
          )
        }
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="
          px-4
          py-2
          bg-black
          text-white
          rounded-lg
        "
      >
        {
          loading
            ? "Uploading..."
            : "Upload JD PDF"
        }
      </button>

    </div>
  );
}