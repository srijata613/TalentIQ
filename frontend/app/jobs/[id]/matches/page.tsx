import { matchCandidates }
  from "@/actions/match-candidates";

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } =
    await params;

  const matches =
    await matchCandidates(id);

  return (
    <main className="p-8 max-w-6xl">

      <h1 className="text-4xl font-bold mb-8">
        Candidate Matches
      </h1>

      <div className="space-y-6">

        {matches.map(
          (
            match: any,
            index: number
          ) => (

            <div
              key={index}
              className="border rounded-xl p-6"
            >

              <h2 className="text-2xl font-semibold">
                {
                  match.candidate
                    .parsed_name
                }
              </h2>

              <div className="mt-3">

                <p>
                  Final Score:
                  {" "}
                  {(
                    match.ranking
                      .final_score *
                    100
                  ).toFixed(1)}
                  %
                </p>

                <p>
                  Grade:
                  {" "}
                  {
                    match.ranking
                      .grade
                  }
                </p>

                <p>
                  Recommendation:
                  {" "}
                  {
                    match.ranking
                      .recommendation
                  }
                </p>

              </div>

              <div className="mt-4">

                <h3 className="font-semibold">
                  Matched Skills
                </h3>

                <div className="flex flex-wrap gap-2 mt-2">
                  {match.ranking
                    .matched_skills
                    ?.map(
                      (
                        skill: string
                      ) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-green-100 rounded-full"
                        >
                          {skill}
                        </span>
                      )
                    )}
                </div>

              </div>

              <div className="mt-4">

                <h3 className="font-semibold">
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2 mt-2">
                  {match.ranking
                    .missing_skills
                    ?.map(
                      (
                        skill: string
                      ) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-red-100 rounded-full"
                        >
                          {skill}
                        </span>
                      )
                    )}
                </div>

              </div>

            </div>
          )
        )}

      </div>

    </main>
  );
}