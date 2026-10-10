import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


// The authenticated workspace spans every product route, not just the dashboard.
// Public landing and account routes remain accessible without a session.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/jobs(.*)",
  "/candidates(.*)",
  "/match(.*)",
  "/rank(.*)",
  "/search(.*)",
  "/analyze(.*)",
  "/settings(.*)",

  // New TalentIQ experiences
  "/onboarding/role(.*)",
  "/workspace(.*)",
  "/seeker(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/", "/(api|trpc)(.*)"],
};
