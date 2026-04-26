import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClientPromise } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { imageData, speciesData } = body;

  if (!imageData || !speciesData) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // Convert base64 data URL to buffer for Blob upload
  const base64 = (imageData as string).replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const mimeMatch = (imageData as string).match(/^data:(image\/\w+);base64,/);
  const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const shareId = nanoid(10);

  // Upload photo to Vercel Blob
  const blob = await put(`scans/${shareId}`, buffer, {
    access: "public",
    contentType,
  });

  // Save scan record to MongoDB
  const client = await getMongoClientPromise();
  const db = client.db();

  await db.collection("scans").insertOne({
    shareId,
    userId: session.user.id,
    userName: session.user.name ?? "Explorer",
    photoUrl: blob.url,
    speciesData,
    createdAt: new Date(),
  });

  return NextResponse.json({ shareId });
}
