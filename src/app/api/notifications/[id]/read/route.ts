import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api-proxy";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    // Target: POST /v1/notifications/{id}/read
    return proxyRequest(request, `/notifications/${id}/read`, {
        method: "POST"
    });
}
