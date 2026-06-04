import Link from "next/link";
import { getJobs } from "@/actions/get-jobs";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Jobs
        </h1>

        <Link
          href="/jobs/new"
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          New Job
        </Link>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="border rounded-xl p-6">
            No jobs yet
          </div>
        ) : (
          jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block border rounded-xl p-6 hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">
                {job.title}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Status: {job.status}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}