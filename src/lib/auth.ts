export type Role = "staff" | "supervisor" | "manager" | "hr" | "admin";

export interface SessionUser {
  name: string;
  role: Role;
}

/**
 * Replace this later with:
 * - NextAuth
 * - JWT
 * - Backend session
 */
export function getSessionUser(): SessionUser {
  return {
    name: "John Mutua",
    role: "staff",
  };
}
