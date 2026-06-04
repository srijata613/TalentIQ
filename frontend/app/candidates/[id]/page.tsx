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

      {candidate?.parsed_name && (
        <div className="mt-8 space-y-4">
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

          <div>
            <h2 className="font-semibold mb-2">
              Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {(candidate.parsed_skills ?? [])
                .map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-green-100 text-black rounded-full"
                  >
                    {skill}
                  </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}