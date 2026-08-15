import * as FileSystem from "expo-file-system/legacy";

import { env } from "@/lib/env";
import { clearCachedGuestId, getReporterId } from "@/lib/identity";

import { IssueFormData, MediaItem } from "../types/issue";

export type SubmitReportResult = {
  issueId: string;
};

type IssueUploadResult = { status: number; body: string };

function inferCity(address: string): string | undefined {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return undefined;

  const last = parts[parts.length - 1];
  if (last.toLowerCase() === "nepal" && parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return last;
}

// Expo SDK 57's fetch/FormData/Blob polyfill can't build a multipart body
// from a local file:// URI on this project's setup (RN's Blob can't be
// constructed from JS binary data — see BlobManager.createFromParts).
// FileSystem.uploadAsync uploads straight from disk natively, sidestepping
// that whole Blob machinery. It only takes one file per call, so the issue
// is created together with the first media item, and any additional items
// are attached with follow-up calls to /community/issues/{id}/media.

async function uploadIssueWithFirstFile(
  reporterId: string,
  form: IssueFormData,
  firstMedia: MediaItem
): Promise<IssueUploadResult> {
  const parameters: Record<string, string> = {
    reporter_id: reporterId,
    category: form.category,
    description: form.description,
    severity: form.severity,
    latitude: String(form.location.latitude),
    longitude: String(form.location.longitude),
    address: form.location.address,
  };
  const city = inferCity(form.location.address);
  if (city) parameters.city = city;

  const result = await FileSystem.uploadAsync(`${env.advisorApiUrl}/community/issues`, firstMedia.uri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: "files",
    mimeType: firstMedia.mimeType,
    parameters,
  });

  return { status: result.status, body: result.body };
}

async function uploadAdditionalMedia(reporterId: string, issueId: string, item: MediaItem): Promise<void> {
  await FileSystem.uploadAsync(`${env.advisorApiUrl}/community/issues/${issueId}/media`, item.uri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: "file",
    mimeType: item.mimeType,
    parameters: { reporter_id: reporterId },
  });
}

async function postIssue(reporterId: string, form: IssueFormData): Promise<IssueUploadResult> {
  const [firstMedia, ...restMedia] = form.media;
  if (!firstMedia) {
    throw new Error("At least one photo or video is required.");
  }

  const result = await uploadIssueWithFirstFile(reporterId, form, firstMedia);

  if (result.status >= 200 && result.status < 300 && restMedia.length > 0) {
    const data: { issue: { id: string } } = JSON.parse(result.body);
    for (const item of restMedia) {
      await uploadAdditionalMedia(reporterId, data.issue.id, item);
    }
  }

  return result;
}

export async function submitReport(form: IssueFormData): Promise<SubmitReportResult> {
  let reporterId = await getReporterId();
  let result = await postIssue(reporterId, form);

  if (result.status === 422) {
    // Cached guest id no longer exists on the backend (e.g. a database
    // reset) — register a fresh one and retry once before giving up.
    await clearCachedGuestId();
    reporterId = await getReporterId();
    result = await postIssue(reporterId, form);
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Request failed (${result.status})`);
  }

  const data: { issue: { id: string } } = JSON.parse(result.body);
  return { issueId: data.issue.id };
}
