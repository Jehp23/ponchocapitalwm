import { demoUsers, isPrismaUnavailable } from "@/lib/demo-data";

export async function withDemoFallback<T>(factory: () => Promise<T>, fallback: () => T | Promise<T>) {
  try {
    return await factory();
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && isPrismaUnavailable(error)) {
      return fallback();
    }

    throw error;
  }
}

export function getDemoUserByCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (normalizedEmail === demoUsers.admin.email && normalizedPassword === demoUsers.admin.password) {
    return {
      id: demoUsers.admin.id,
      email: demoUsers.admin.email,
      name: demoUsers.admin.name,
      role: demoUsers.admin.role,
      clientId: null
    };
  }

  if (normalizedEmail === demoUsers.client.email && normalizedPassword === demoUsers.client.password) {
    return {
      id: demoUsers.client.id,
      email: demoUsers.client.email,
      name: demoUsers.client.name,
      role: demoUsers.client.role,
      clientId: demoUsers.client.clientId
    };
  }

  return null;
}
