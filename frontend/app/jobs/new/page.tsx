import CreateJobForm
  from "../../../components/create-job-form";

import { getJobTemplates }
  from "@/actions/get-job-templates";

export default async function NewJobPage() {

  const templates =
    await getJobTemplates();

  return (
    <main className="min-h-screen p-8">
      <CreateJobForm
        templates={templates}
      />
    </main>
  );
}