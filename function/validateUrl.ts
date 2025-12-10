/**
 * Validate and normalize a URL.
 * - Adds 'https://' if no protocol is present.
 * - Throws if the URL is invalid or uses an unsafe protocol (e.g., javascript:).
 */
export function validateUrl(url: string): string {
  if (!url) {
    throw new Error("URL cannot be empty");
  }

  // 1. Sanitize: Remove leading/trailing whitespace
  let input = url.trim();

  // 2. Normalize: Add https:// if the string lacks a protocol
  // We check for a pattern like "scheme://" at the start.
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input)) {
    input = `https://${input}`;
  }

  try {
    const urlObj = new URL(input);

    // 3. Security: Allow only http and https protocols
    // This blocks 'javascript:', 'file:', 'ftp:', etc.
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      throw new Error("Only HTTP and HTTPS protocols are allowed.");
    }

    // 4. Return the normalized string (e.g., adds trailing slash if needed, lowercase host)
    return urlObj.href;
  } catch (error) {
    // If the error is ours, rethrow it. Otherwise, it's a parsing error.
    if (
      error instanceof Error &&
      error.message.includes("protocols are allowed")
    ) {
      throw error;
    }
    throw new Error("Invalid URL format.");
  }
}
