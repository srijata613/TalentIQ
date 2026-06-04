import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { syncUser } from "@/actions/sync-user";
import CreateOrganizationForm from "@/components/create-organization-form";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  await syncUser();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUser?.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("memberships")
    .select(`
      *,
      organizations (*)
    `)
    .eq("user_id", user?.id)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="min-h-screen p-8">
        <CreateOrganizationForm />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">
        {membership.organizations.name}
      </h1>

      <p className="mt-2 text-gray-600">
        Role: {membership.role}
      </p>
    </main>
  );
}