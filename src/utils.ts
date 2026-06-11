export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a safe, clickable anchor for terminal output. */
export function link(url: string, label?: string): string {
  return (
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
    `${escapeHtml(label ?? url)}</a>`
  );
}
