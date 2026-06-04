import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">
        TalentIQ
      </h1>

      <p className="mt-4 text-gray-600">
        AI Talent Intelligence Platform
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/sign-in"
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Sign In
        </Link>

        <Link
          href="/sign-up"
          className="px-6 py-3 border rounded-lg"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}