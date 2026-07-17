export const MAX_EVIDENCE_FILES = 10;
export const MAX_EVIDENCE_URLS = 5;
export const MAX_EVIDENCE_ENCODED_LENGTH = 400;

export type EvidenceRefKind = "file" | "url";

export type EncodedEvidenceRef = {
  kind: EvidenceRefKind;
  id: string;
};

const FILE_PREFIX = "f:";
const URL_PREFIX = "u:";
const REF_ID_RE = /^[a-zA-Z0-9_-]{8,32}$/;

export function encodeEvidenceRefs(refs: EncodedEvidenceRef[]): string {
  const files = refs.filter((ref) => ref.kind === "file");
  const urls = refs.filter((ref) => ref.kind === "url");

  if (files.length > MAX_EVIDENCE_FILES) {
    throw new Error(`Maximum ${MAX_EVIDENCE_FILES} files allowed`);
  }
  if (urls.length > MAX_EVIDENCE_URLS) {
    throw new Error(`Maximum ${MAX_EVIDENCE_URLS} URLs allowed`);
  }

  for (const ref of refs) {
    if (!REF_ID_RE.test(ref.id)) {
      throw new Error(`Invalid evidence ref id: ${ref.id}`);
    }
  }

  const encoded = refs
    .map((ref) =>
      ref.kind === "file" ? `${FILE_PREFIX}${ref.id}` : `${URL_PREFIX}${ref.id}`,
    )
    .join("&");

  if (encoded.length > MAX_EVIDENCE_ENCODED_LENGTH) {
    throw new Error(
      `Evidence references exceed ${MAX_EVIDENCE_ENCODED_LENGTH} characters`,
    );
  }

  return encoded;
}

export function decodeEvidenceRefs(
  evidence: string | undefined | null,
): EncodedEvidenceRef[] {
  if (!evidence?.trim()) return [];

  const trimmed = evidence.trim();

  if (!trimmed.includes("&") && !trimmed.startsWith("f:") && !trimmed.startsWith("u:")) {
    return [];
  }

  const parts = trimmed.split("&").map((part) => part.trim()).filter(Boolean);
  const refs: EncodedEvidenceRef[] = [];

  for (const part of parts) {
    if (part.startsWith(FILE_PREFIX)) {
      const id = part.slice(FILE_PREFIX.length);
      if (REF_ID_RE.test(id)) {
        refs.push({ kind: "file", id });
      }
      continue;
    }
    if (part.startsWith(URL_PREFIX)) {
      const id = part.slice(URL_PREFIX.length);
      if (REF_ID_RE.test(id)) {
        refs.push({ kind: "url", id });
      }
    }
  }

  return refs;
}

export function isEncodedEvidenceString(evidence: string | undefined | null): boolean {
  return decodeEvidenceRefs(evidence).length > 0;
}

/** Legacy free-form URL extraction (pre-encoded evidence). */
export function parseLegacyEvidenceLinks(
  evidence: string | undefined | null,
): string[] {
  if (!evidence?.trim()) return [];
  if (isEncodedEvidenceString(evidence)) return [];

  const urls = evidence.match(/https?:\/\/[^\s,;]+/gi);
  if (urls && urls.length > 0) {
    return urls.map((url) => url.replace(/[),.;]+$/, ""));
  }

  const trimmed = evidence.trim();
  if (/^https?:\/\//i.test(trimmed)) return [trimmed];
  return [];
}
