import { createSupabaseServerClient }
  from "@/lib/supabase-server";

import AnalyzeCandidateButton
  from "@/components/analyze-candidate-button";

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase =
    createSupabaseServerClient();

  const { data: candidate } =
    await supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single();

  return (
    <main className="min-h-screen p-8 max-w-5xl">
      <h1 className="text-4xl font-bold">
        Candidate
      </h1>

      <div className="mt-6">
        <AnalyzeCandidateButton
          candidateId={id}
        />
      </div>

      <div className="mt-4">
        <span className="px-3 py-1 bg-gray-100 rounded-full">
          Status: {candidate?.status ?? "uploaded"}
          </span>
        </div>

      {candidate && (<div className="mt-8 space-y-6">

  <div>
    <h2 className="font-semibold">
      Name
    </h2>
    <p>{candidate.parsed_name}</p>
  </div>

  <div>
    <h2 className="font-semibold">
      Email
    </h2>
    <p>{candidate.parsed_email}</p>
  </div>

  <div>
    <h2 className="font-semibold">
      Phone
    </h2>
    <p>{candidate.parsed_phone}</p>
  </div>

  {candidate.parsed_linkedin && (
    <div>
      <h2 className="font-semibold">
        LinkedIn
      </h2>

      <a
        href={candidate.parsed_linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {candidate.parsed_linkedin}
      </a>
    </div>
  )}

  {candidate.parsed_github && (
    <div>
      <h2 className="font-semibold">
        GitHub
      </h2>

      <a
        href={candidate.parsed_github}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {candidate.parsed_github}
      </a>
    </div>
  )}

  {candidate.parsed_portfolio && (
    <div>
      <h2 className="font-semibold">
        Portfolio
      </h2>

      <a
        href={candidate.parsed_portfolio}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {candidate.parsed_portfolio}
      </a>
    </div>
  )}

  <div>
    <h2 className="font-semibold mb-2">
      Skills
    </h2>

    <div className="flex flex-wrap gap-2">
      {(candidate.parsed_skills ?? []).map(
        (skill: string) => (
          <span
            key={skill}
            className="px-3 py-1 bg-green-100 text-black rounded-full"
          >
            {skill}
          </span>
        )
      )}
    </div>
  </div>

  {candidate.parsed_degrees?.length > 0 && (
    <div>
      <h2 className="font-semibold mb-2">
        Degrees
      </h2>

      <div className="flex flex-wrap gap-2">
        {candidate.parsed_degrees.map(
          (degree: string) => (
            <span
              key={degree}
              className="px-3 py-1 bg-blue-100 rounded-full"
            >
              {degree}
            </span>
          )
        )}
      </div>
    </div>
  )}

  {candidate.parsed_graduation_years?.length > 0 && (
    <div>
      <h2 className="font-semibold mb-2">
        Graduation Years
      </h2>

      <div className="flex flex-wrap gap-2">
        {candidate.parsed_graduation_years.map(
          (year: string) => (
            <span
              key={year}
              className="px-3 py-1 bg-yellow-100 rounded-full"
            >
              {year}
            </span>
          )
        )}
      </div>
    </div>
  )}

  {candidate.parsed_designations?.length > 0 && (
    <div>
      <h2 className="font-semibold mb-2">
        Designations
      </h2>

      <div className="flex flex-wrap gap-2">
        {candidate.parsed_designations.map(
          (designation: string) => (
            <span
              key={designation}
              className="px-3 py-1 bg-purple-100 rounded-full"
            >
              {designation}
            </span>
          )
        )}
      </div>
    </div>
  )}

</div>
      )}
    </main>
  );
}