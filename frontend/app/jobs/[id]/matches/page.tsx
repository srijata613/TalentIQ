import { getJobMatches }
  from "@/actions/get-job-matches";

export default async function JobMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } =
    await params;

  const matches =
    await getJobMatches(id);

  return (
    <main className="min-h-screen p-8 max-w-7xl">

      <h1 className="text-4xl font-bold">
        Candidate Rankings
      </h1>

      <div className="mt-8 space-y-4">

        {matches.map(
          (match: any, index) => (

            <div
              key={match.id}
              className="border rounded-xl p-6"
            >

              <div className="flex justify-between">

                <div>

                  <h2 className="text-xl font-semibold">

                    #{index + 1}

                    {" "}

                    {match.candidates
                      ?.parsed_name ??
                      "Unknown Candidate"}

                  </h2>

                  <p className="text-gray-500">
                    {
                      match.candidates
                        ?.parsed_email
                    }
                  </p>

                </div>

                <div className="text-right">

                  <div className="text-3xl font-bold">

                    {(
                      match.final_score *
                      100
                    ).toFixed(1)}
                    %

                  </div>

                  <div>
                    Grade:
                    {" "}
                    {match.grade}
                  </div>

                </div>

              </div>

              <div className="mt-4">

                <span
                  className="
                    px-3
                    py-1
                    bg-green-100
                    rounded-full
                  "
                >
                  {
                    match.recommendation
                  }
                </span>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

                <div>
                  Skill:
                  {" "}
                  {(
                    match.skill_score *
                    100
                  ).toFixed(0)}
                  %
                </div>

                <div>
                  Experience:
                  {" "}
                  {(
                    match.experience_score *
                    100
                  ).toFixed(0)}
                  %
                </div>

                <div>
                  Domain:
                  {" "}
                  {(
                    match.domain_score *
                    100
                  ).toFixed(0)}
                  %
                </div>

                <div>
                  Leadership:
                  {" "}
                  {(
                    match.leadership_score *
                    100
                  ).toFixed(0)}
                  %
                </div>

              </div>

              <div className="mt-6">

                <h3 className="font-semibold">
                  Strengths
                </h3>

                <ul className="list-disc pl-6">

                  {(
                    match.strengths ??
                    []
                  ).map(
                    (
                      item: string
                    ) => (
                      <li
                        key={item}
                      >
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="mt-4">

                <h3 className="font-semibold">
                  Weaknesses
                </h3>

                <ul className="list-disc pl-6">

                  {(
                    match.weaknesses ??
                    []
                  ).map(
                    (
                      item: string
                    ) => (
                      <li
                        key={item}
                      >
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </div>

            </div>
          )
        )}

      </div>

    </main>
  );
}