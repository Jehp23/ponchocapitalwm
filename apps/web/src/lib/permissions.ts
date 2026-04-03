import { UserRole } from "@prisma/client";

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin",
  ADVISOR: "/admin",
  CLIENT: "/client"
};

export function canAccessAdmin(role?: UserRole | null) {
  return role === UserRole.ADMIN || role === UserRole.ADVISOR;
}

export function canAccessClient(role?: UserRole | null) {
  return role === UserRole.CLIENT || role === UserRole.ADMIN || role === UserRole.ADVISOR;
}
