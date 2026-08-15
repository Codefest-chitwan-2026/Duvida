import { env } from "@/lib/env";
import { clearCachedGuestId, getReporterId } from "@/lib/identity";

import { IssueFormData, MediaItem } from "../types/issue";

export type SubmitReportResult = {
  issueId: string;
};

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

async function appendMedia(formData: FormData, items: MediaItem[]): Promise<void> {
  for (const item of items) {
    const fileResponse = await fetch(item.uri);
    const blob = await fileResponse.blob();
    formData.append("files", new Blob([blob], { type: item.mimeType }), item.name);
  }
}

async function buildFormData(reporterId: string, form: IssueFormData): Promise<FormData> {
  const formData = new FormData();
  formData.append("reporter_id", reporterId);
  formData.append("category", form.category);
  formData.append("description", form.description);
  formData.append("severity", form.severity);
  formData.append("latitude", String(form.location.latitude));
  formData.append("longitude", String(form.location.longitude));
  formData.append("address", form.location.address);

  const city = inferCity(form.location.address);
  if (city) formData.append("city", city);

  await appendMedia(formData, form.media);
  return formData;
}

async function postIssue(reporterId: string, form: IssueFormData): Promise<Response> {
  const formData = await buildFormData(reporterId, form);
  return fetch(`${env.advisorApiUrl}/community/issues`, {
    method: "POST",
    body: formData,
  });
}

export async function submitReport(form: IssueFormData): Promise<SubmitReportResult> {
  let reporterId = await getReporterId();
  let response = await postIssue(reporterId, form);

  if (response.status === 422) {
    // Cached guest id no longer exists on the backend (e.g. a database
    // reset) — register a fresh one and retry once before giving up.
    await clearCachedGuestId();
    reporterId = await getReporterId();
    response = await postIssue(reporterId, form);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const data: { issue: { id: string } } = await response.json();
  return { issueId: data.issue.id };
}
