"use client";

import { useState } from "react";

import {
  importJobUrl,
} from "@/actions/import-job-url";

export default function ImportJobUrlForm() {
  const [title, setTitle] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleImport() {
    try {
      setLoading(true);

      const job =
        await importJobUrl(
          title,
          url
        );

      window.location.href =
        `/jobs/${job.id}`;

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to import job"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="max-w-3xl space-y-4">

      <h1 className="text-3xl font-bold">
        Import Job URL
      </h1>

      <input
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
        placeholder="Senior ML Engineer"
        className="w-full border p-3 rounded-lg"
      />

      <input
        value={url}
        onChange={(e) =>
          setUrl(
            e.target.value
          )
        }
        placeholder="https://company.com/job"
        className="w-full border p-3 rounded-lg"
      />

      <button
        onClick={handleImport}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        {loading
          ? "Importing..."
          : "Import Job"}
      </button>

    </div>
  );
}