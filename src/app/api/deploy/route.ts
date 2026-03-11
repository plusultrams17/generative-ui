import { NextRequest, NextResponse } from "next/server";

type DeployFile = {
  file: string;
  data: string;
};

type DeployRequest = {
  token: string;
  projectName: string;
  files: DeployFile[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeployRequest;

    if (!body.token || !body.projectName || !body.files?.length) {
      return NextResponse.json(
        { error: "token, projectName, files are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${body.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.projectName,
        files: body.files.map((f) => ({
          file: f.file,
          data: f.data,
        })),
        projectSettings: {
          framework: "nextjs",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData as Record<string, Record<string, string>>)?.error?.message ||
        `Vercel API error: ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = (await response.json()) as {
      id: string;
      url: string;
      readyState: string;
    };

    return NextResponse.json({
      id: data.id,
      url: `https://${data.url}`,
      readyState: data.readyState,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Deployment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
