import { redirect } from "next/navigation";
import { getProfile, isLinkManager } from "../../lib/auth";
import { SignInCard } from "./SignInCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in — Iconic Faculty",
  description: "Sign in to manage Iconic Faculty links.",
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const profile = await getProfile();
  if (profile && isLinkManager(profile)) {
    redirect("/admin");
  }

  let authError = null;
  if (params?.error === "auth_failed") {
    authError = "Sign-in didn't complete. Please try again.";
  } else if (params?.error === "unauthorized") {
    authError = "Your account does not have admin / link manager access.";
  }

  const nextPath = typeof params?.next === "string" ? params.next : "/admin";
  return <SignInCard authError={authError} next={nextPath} />;
}
