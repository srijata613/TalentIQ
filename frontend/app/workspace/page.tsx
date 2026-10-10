"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  getExperienceRoleStorageKey,
  isExperienceRole,
} from "@/lib/experience-role";

export default function WorkspaceRedirectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      router.replace("/sign-in");
      return;
    }

    const savedRole = window.localStorage.getItem(
      getExperienceRoleStorageKey(user.id),
    );

    const destination =
      isExperienceRole(savedRole) && savedRole === "job-seeker"
        ? "/seeker/dashboard"
        : "/dashboard";

    router.replace(destination);
  }, [isLoaded, user?.id, router]);

  return (
    <main className="workspace-redirect">
      <div className="workspace-redirect-mark">T</div>
      <p>Preparing your TalentIQ workspace…</p>
    </main>
  );
}