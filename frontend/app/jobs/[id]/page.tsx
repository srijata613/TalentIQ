import { getJob } from "@/actions/get-job";
import AnalyzeJobButton from "@/components/analyze-job-button";
import Link from "next/link";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { job, versions, analysis } = await getJob(id);

  if (!job) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">
          Job not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl">
      {/* Header */}
      <h1 className="text-4xl font-bold">
        {job.title}
      </h1>

      <p className="mt-2 text-gray-500">
        Status: {job.status}
      </p>

      {/* Analyze Button */}
      <div className="mt-4">
        <AnalyzeJobButton
          jobId={job.id}
          content={versions?.[0]?.content ?? ""}
        />
      </div>

      {/* Matches Button */}
      <div className="mt-4">
        <Link
          href={`/jobs/${job.id}/matches`}
          className="
          inline-block
          px-4
          py-2
          bg-blue-600
          text-white
          rounded-lg
          "
        >
          View Candidate Matches
        </Link>
      </div>

      {/* Extracted Skills */}
      {analysis?.required_skills &&
        analysis.required_skills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              Extracted Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {analysis.required_skills.map(
                (skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/*Experience*/}
        {analysis?.experience_requirements?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              Experience Requirements
              </h2>
              
              <ul className="list-disc pl-5">
                {analysis.experience_requirements.map(
                  (item: string) => (
                  <li key={item}>{item}</li>
                )
                )}
                </ul>
                </div>
              )}
      {/* Education Requirements */}
      {analysis?.education_requirements?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Education Requirements
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {analysis.education_requirements.map(
                (item: string) => (
                <span
                key={item}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  {item}
                  </span>
                  )
                  )}
                  </div>
                  </div>
                )}

      {/*Certifications*/}
      {analysis?.certifications?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Certifications
            </h2>

            <div className="flex flex-wrap gap-2">
              {analysis.certifications.map(
                (item: string) => (
                <span
                key={item}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full"
                >
                  {item}
                  </span>
                  )
                  )}
                  </div>
                  </div>
                )}


      {/* Version History */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Version History
        </h2>

        <div className="space-y-4">
          {versions.map((version: any) => (
            <div
              key={version.id}
              className="border rounded-xl p-4"
            >
              <h3 className="font-medium">
                Version {version.version_number}
              </h3>

              <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">
                {version.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}