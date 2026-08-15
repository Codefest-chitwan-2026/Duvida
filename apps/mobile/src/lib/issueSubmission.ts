import { supabase } from "@/lib/supabase";

import type { IssueFormData, MediaItem } from "../../types/issue";

const ISSUE_MEDIA_BUCKET = "issue-media";

const CATEGORY_SLUGS: Record<IssueFormData["category"], string> = {
  pothole: "pothole",
  streetlight: "streetlight",
  garbage: "garbage",
  traffic: "traffic",
  water: "water_leak",
  other: "other",
};

function sanitizeStorageName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "media";
}

async function readBlobFromUri(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Unable to read media file from ${uri}`);
  }
  return response.blob();
}

async function uploadIssueMedia(issueId: string, media: MediaItem[], userId: string) {
  if (media.length === 0) return [];

  const uploadedPaths: string[] = [];

  for (const [index, item] of media.entries()) {
    const blob = await readBlobFromUri(item.uri);
    const safeName = sanitizeStorageName(item.name || `media-${index + 1}`);
    const storagePath = `${issueId}/${Date.now()}-${index + 1}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(ISSUE_MEDIA_BUCKET)
      .upload(storagePath, blob, {
        upsert: false,
        contentType: item.mimeType || "application/octet-stream",
      });

    if (uploadError) {
      throw new Error(`Media upload failed: ${uploadError.message}`);
    }

    const { error: dbError } = await supabase.from("issue_media").insert({
      issue_id: issueId,
      uploaded_by: userId,
      media_type: item.mediaType,
      storage_path: storagePath,
      caption: item.name,
    });

    if (dbError) {
      throw new Error(`Could not save media metadata: ${dbError.message}`);
    }

    uploadedPaths.push(storagePath);
  }

  return uploadedPaths;
}

const DUPLICATE_SEARCH_RADIUS_METERS = 500;

export interface NearbyIssueMatch {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  createdAt: string;
  distanceMeters: number;
}

export async function findNearbyDuplicateIssue(formData: IssueFormData): Promise<NearbyIssueMatch | null> {
  const { data: matches, error } = await supabase.rpc("find_nearby_issues", {
    p_latitude: formData.location.latitude,
    p_longitude: formData.location.longitude,
    p_radius_meters: DUPLICATE_SEARCH_RADIUS_METERS,
    p_limit: 10,
  });

  if (error) {
    throw new Error(`Duplicate check failed: ${error.message}`);
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  const { data: categories, error: categoryError } = await supabase
    .from("issue_categories")
    .select("id, slug");

  if (categoryError) {
    throw new Error(`Could not load issue categories: ${categoryError.message}`);
  }

  const slugById = new Map((categories ?? []).map((category) => [category.id, category.slug]));

  const match = matches.find((issue: { category_id: string }) => {
    return slugById.get(issue.category_id) === CATEGORY_SLUGS[formData.category];
  });

  if (!match) return null;

  return {
    id: match.id,
    title: match.title,
    description: match.description,
    address: match.address,
    createdAt: match.created_at,
    distanceMeters: match.distance_meters,
  };
}

export async function submitIssueReport(formData: IssueFormData) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in before submitting a report.");
  }

  const { data: category, error: categoryError } = await supabase
    .from("issue_categories")
    .select("id")
    .eq("slug", CATEGORY_SLUGS[formData.category])
    .single();

  if (categoryError || !category) {
    throw new Error(`Issue category not found: ${CATEGORY_SLUGS[formData.category]}`);
  }

  const title = formData.description.trim().slice(0, 140) || "Community issue report";

  const { data: issue, error: issueError } = await supabase
    .from("issues")
    .insert({
      reporter_id: user.id,
      category_id: category.id,
      title,
      description: formData.description.trim(),
      status: "submitted",
      severity: formData.severity,
      location: {
        type: "Point",
        coordinates: [formData.location.longitude, formData.location.latitude],
      },
      address: formData.location.address,
      city: formData.location.address,
    })
    .select("id")
    .single();

  if (issueError || !issue) {
    throw new Error(`Issue submission failed: ${issueError?.message ?? "Unknown error"}`);
  }

  await uploadIssueMedia(issue.id, formData.media, user.id);

  return issue.id;
}

export async function supportExistingIssue(issueId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in before supporting a report.");
  }

  const { error } = await supabase
    .from("issue_upvotes")
    .upsert({ issue_id: issueId, user_id: user.id }, { onConflict: "issue_id,user_id", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Could not support this report: ${error.message}`);
  }
}

// Presentational only — the real DB id (uuid) is still what's stored and
// used for every lookup/support/RLS check; this just shortens it for display.
export function formatIssueReference(issueId: string): string {
  return `RPT-${issueId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function formatRelativeTime(isoTimestamp: string): string {
  const elapsedMs = Date.now() - new Date(isoTimestamp).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);

  if (elapsedMinutes < 1) return "just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}
