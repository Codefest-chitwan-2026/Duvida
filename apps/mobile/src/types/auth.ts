import type { UserRole } from "@duvidha/shared";

export type { UserRole };

export type Profile = {
  id: string;
  fullName: string | null;
  avatarPath: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_path: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarPath: row.avatar_path,
    role: row.role as UserRole,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
