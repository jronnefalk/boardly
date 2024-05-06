import { NextResponse } from "next/server";
import { getUserInfo } from "@/lib/auth";

export async function GET() {
    const data = await getUserInfo();
    return NextResponse.json(data);
}
