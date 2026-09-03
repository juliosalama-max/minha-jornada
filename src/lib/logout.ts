import { signOut } from "@/lib/auth/client";
import { useJournal } from "@/lib/journal-store";

/** Ends the session and goes to login. Use this from every Sair button. */
export async function logOut() {
  useJournal.getState().clear();
  try {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
  } catch {
    /* cookie session may still need the official client call */
  }
  try {
    sessionStorage.removeItem("grok-auth.bearer-token");
  } catch {
    /* storage blocked */
  }
  await signOut("/login");
}
