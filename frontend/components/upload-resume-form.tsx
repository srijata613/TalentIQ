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
        data: uploadData,
        error: uploadError,
      } = await supabaseBrowser.storage
        .from("resumes")
        .upload(fileName, file);

      console.log("UPLOAD RESULT:", uploadData);
      console.log("UPLOAD ERROR:", uploadError);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await supabaseBrowser.storage
        .from("resumes")
        .createSignedUrl(fileName, 60);

      console.log("SIGNED URL:", signedUrlData);
      console.log("SIGNED URL ERROR:", signedUrlError);

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

      window.location.href =
        `/candidates/${candidate.id}`;

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
    <div className="space-y-4">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] ?? null
          )
        }
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        {loading
          ? "Uploading..."
          : "Upload Resume"}
      </button>
    </div>
  );
}