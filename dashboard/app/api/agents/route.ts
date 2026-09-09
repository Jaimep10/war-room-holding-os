import { NextResponse } from "next/server";
import { listAgents } from "@/lib/memoria";

export async function GET() {
  return NextResponse.json({ agents: listAgents() });
}
