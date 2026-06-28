"use client";

import { useTransition }
  from "react";

import { useRouter }
  from "next/navigation";

import { runJobMatching }
  from "@/actions/run-job-matching";

export default function RunMatchingButton({
  jobId,
}: {
  jobId: string;
}) {

  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] = useTransition();

  return (

    <button

      disabled={pending}

      onClick={() =>
        startTransition(
          async () => {

            await runJobMatching(
              jobId
            );

            router.push(
              `/jobs/${jobId}/matches`
            );
          }
        )
      }

      className="
        px-4
        py-2
        bg-blue-600
        text-white
        rounded-lg
      "
    >

      {pending
        ? "Matching..."
        : "Run Matching"}

    </button>
  );
}