export type ExperienceRole = "recruiter" | "job-seeker";

const STORAGE_PREFIX = "talentiq:experience-role:";

export function getExperienceRoleStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function isExperienceRole(
  value: string | null,
): value is ExperienceRole {
  return value === "recruiter" || value === "job-seeker";
}