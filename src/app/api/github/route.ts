import { NextRequest, NextResponse } from "next/server";

type GitHubFile = {
  path: string;
  content: string;
};

type GitHubRequest = {
  token: string;
  repoName: string;
  description: string;
  files: GitHubFile[];
  isPrivate?: boolean;
};

const GITHUB_API = "https://api.github.com";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "generative-ui-app",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubFetch(
  url: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    ...options,
    headers: { ...headers(token), ...(options.headers as Record<string, string>) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as Record<string, string>).message || `GitHub API error: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GitHubRequest;

    if (!body.token || !body.repoName || !body.files?.length) {
      return NextResponse.json(
        { error: "token, repoName, files are required" },
        { status: 400 }
      );
    }

    for (const file of body.files) {
      if (file.path.includes("..") || file.path.startsWith("/")) {
        return NextResponse.json(
          { error: "Invalid file path" },
          { status: 400 }
        );
      }
    }

    // 1. Create the repository with auto_init to get an initial commit
    const repo = (await githubFetch(`${GITHUB_API}/user/repos`, body.token, {
      method: "POST",
      body: JSON.stringify({
        name: body.repoName,
        description: body.description || "Generated UI Component",
        private: body.isPrivate ?? false,
        auto_init: true,
      }),
    })) as { full_name: string; html_url: string; owner: { login: string } };

    const owner = repo.owner.login;
    const repoName = body.repoName;

    // 2. Wait briefly for the initial commit to be available
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 3. Upload each file sequentially using the Contents API
    for (const file of body.files) {
      const encoded = Buffer.from(file.content).toString("base64");

      // Check if file already exists (e.g. README.md from auto_init)
      let sha: string | undefined;
      try {
        const existing = (await githubFetch(
          `${GITHUB_API}/repos/${owner}/${repoName}/contents/${file.path}`,
          body.token
        )) as { sha: string };
        sha = existing.sha;
      } catch {
        // File doesn't exist yet, that's fine
      }

      await githubFetch(
        `${GITHUB_API}/repos/${owner}/${repoName}/contents/${file.path}`,
        body.token,
        {
          method: "PUT",
          body: JSON.stringify({
            message: sha
              ? `Update ${file.path}`
              : `Add ${file.path}`,
            content: encoded,
            ...(sha ? { sha } : {}),
          }),
        }
      );
    }

    return NextResponse.json({
      repoUrl: repo.html_url,
      repoName,
      owner,
    });
  } catch (error) {
    console.error("GitHub push error:", error);
    return NextResponse.json(
      { error: "GitHubへのプッシュに失敗しました" },
      { status: 500 }
    );
  }
}
