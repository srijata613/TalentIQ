"use client";

import { useState } from "react";
import { createOrganization } from "@/actions/create-organization";

export default function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      await createOrganization(name);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-2xl font-bold">
        Create Your Organization
      </h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Acme AI"
        className="w-full border rounded-lg p-3"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        {loading ? "Creating..." : "Create Organization"}
      </button>
    </div>
  );
}