import { NextResponse } from "next/server";

import { fetchImages } from "@/lib/FetchImages";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const offsetParam = Number.parseInt(searchParams.get("offset") ?? "", 10);

  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT;
  const offset =
    Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  try {
    const images = await fetchImages({ limit, offset });
    return NextResponse.json({ data: images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
