import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api-proxy";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    // Target: POST /v1/notifications/{id}/read
    return proxyRequest(request, `/v1/notifications/${id}/read`);
}
