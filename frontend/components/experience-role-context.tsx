"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import {
  getExperienceRoleStorageKey,
  isExperienceRole,
  type ExperienceRole,
} from "@/lib/experience-role";

interface ExperienceRoleContextValue {
  role: ExperienceRole;
  setRole: (role: ExperienceRole) => void;
  isPreferenceLoaded: boolean;
}

const ExperienceRoleContext =
  createContext<ExperienceRoleContextValue | null>(null);

export function ExperienceRoleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [role, setRoleState] = useState<ExperienceRole>("recruiter");
  const [isPreferenceLoaded, setIsPreferenceLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      setRoleState("recruiter");
      setIsPreferenceLoaded(true);
      return;
    }

    const savedRole = window.localStorage.getItem(
      getExperienceRoleStorageKey(user.id),
    );

    setRoleState(
      isExperienceRole(savedRole) ? savedRole : "recruiter",
    );
    setIsPreferenceLoaded(true);
  }, [isLoaded, user?.id]);

  const setRole = useCallback(
    (nextRole: ExperienceRole) => {
      setRoleState(nextRole);

      if (user?.id) {
        window.localStorage.setItem(
          getExperienceRoleStorageKey(user.id),
          nextRole,
        );
      }
    },
    [user?.id],
  );

  return (
    <ExperienceRoleContext.Provider
      value={{ role, setRole, isPreferenceLoaded }}
    >
      {children}
    </ExperienceRoleContext.Provider>
  );
}

export function useExperienceRole() {
  const context = useContext(ExperienceRoleContext);

  if (!context) {
    throw new Error(
      "useExperienceRole must be used inside ExperienceRoleProvider.",
    );
  }

  return context;
}