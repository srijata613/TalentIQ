import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CreateOrganizationForm from "@/components/create-organization-form";
import CandidateDirectory from "@/components/candidate-directory";
import Icon from "@/components/icon";

export const metadata: Metadata = { title: "Candidates" };

export default async function CandidatesPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase.from("users").select("id").eq("clerk_user_id", clerkUser.id).maybeSingle();
  const { data: membership } = await supabase.from("memberships").select("organization_id").eq("user_id", user?.id).maybeSingle();

  if (!membership) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-mark"><Icon name="building" size={22} /></div>
        <p className="eyebrow">Workspace setup</p>
        <h1 className="page-title">Set up your organization first</h1>
        <p className="page-subtitle">Your talent pool is scoped to an organization. Create your workspace to start adding candidates.</p>
        <div className="glass page-form-panel"><CreateOrganizationForm /></div>
      </div>
    );
  }

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("id, parsed_name, parsed_email, parsed_phone, parsed_skills, status, created_at")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  return (
    <div className="workspace-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">Workspace / Talent pool</p>
          <h1 className="page-title">Candidates</h1>
          <p className="page-subtitle">Your organization's talent pool, with searchable profiles and resume status.</p>
        </div>
        <div className="page-heading-actions">
          <Link href="/analyze/resume" className="btn btn-secondary"><Icon name="sparkles" size={15} /> Analyze resume</Link>
          <Link href="/candidates/upload" className="btn btn-primary"><Icon name="upload" size={15} /> Add candidates</Link>
        </div>
      </div>

      {error ? (
        <div className="listing-panel content-empty-state">
          <span className="empty-state-icon"><Icon name="x" size={22} /></span>
          <h2>We couldn't load the candidate list</h2>
          <p>{error.message}</p>
          <Link href="/dashboard" className="btn btn-secondary">Back to overview</Link>
        </div>
      ) : (
        <CandidateDirectory candidates={(candidates ?? []) as Array<{
          id: string;
          parsed_name: string | null;
          parsed_email: string | null;
          parsed_phone: string | null;
          parsed_skills: string[] | null;
          status: string | null;
          created_at: string | null;
        }>} />
      )}
    </div>
  );
}
