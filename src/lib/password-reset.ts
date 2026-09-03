import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Signed-out recovery: set a new password for an existing Better Auth user.
 * Always returns the same shape so we do not leak whether the email exists.
 */
export const resetPasswordByEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; newPassword: string }) => {
    const email = normalizeEmail(data?.email ?? "");
    const newPassword = String(data?.newPassword ?? "");
    if (!email.includes("@")) throw new Error("Informe um e-mail válido.");
    if (newPassword.length < 8) {
      throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
    }
    if (newPassword.length > 128) {
      throw new Error("A nova senha é longa demais.");
    }
    return { email, newPassword };
  })
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { randomBytes } = await import("node:crypto");
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();

    const { auth } = await import("@/lib/auth/server");
    const ctx = await auth.$context;
    const found = await ctx.internalAdapter.findUserByEmail(data.email, {
      includeAccounts: true,
    });
    if (!found?.user) return { ok: true };

    const userId = found.user.id;
    const sql = await getSql();
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from "verification"
      where "value" = ${userId}
        and "createdAt" > now() - interval '15 minutes'
    `;
    if ((recent[0]?.n ?? 0) >= 8) {
      throw new Error("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
    }

    const token = randomBytes(18).toString("hex");
    await ctx.internalAdapter.createVerificationValue({
      value: userId,
      identifier: `reset-password:${token}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const result = await auth.api.resetPassword({
      body: { newPassword: data.newPassword, token },
    });
    if (!result?.status) {
      throw new Error("Não foi possível redefinir a senha. Tente de novo.");
    }

    await ctx.internalAdapter.deleteUserSessions(userId);
    return { ok: true };
  });
