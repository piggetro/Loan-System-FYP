import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

const IMAGE_DIRECTORY = process.env.IMAGE_DIRECTORY ?? "";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const path = `${IMAGE_DIRECTORY}/${data.get("photoPath") as string}`;
  await writeFile(path, buffer);

  return NextResponse.json({ success: true });
}
