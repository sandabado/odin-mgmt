export const ODIN_ROLES = ["super_admin", "booking_director", "artist"] as const;
export type OdinRole = (typeof ODIN_ROLES)[number];

export function canManageOperations(role: OdinRole | null | undefined) {
  return role === "super_admin" || role === "booking_director";
}
