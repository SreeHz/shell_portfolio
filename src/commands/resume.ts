import type { Command } from "../types";

export const resume: Command = {
  name: "resume",
  description: "open my resume (pdf)",
  async run(_args, ctx) {
    const url = `${import.meta.env.BASE_URL}resume.pdf`;
    // Some static servers fall back to index.html with a 200 for missing
    // files, so require a PDF content-type as well.
    const found = await fetch(url, { method: "HEAD" })
      .then(
        (response) =>
          response.ok &&
          (response.headers.get("content-type") ?? "").includes("pdf"),
      )
      .catch(() => false);
    if (!found) {
      ctx.print("resume.pdf is not uploaded yet.", "error");
      ctx.print(
        "(drop your resume at public/resume.pdf in the repo and push)",
        "muted",
      );
      return;
    }
    ctx.print("opening resume.pdf …");
    window.open(url, "_blank", "noopener");
  },
};
