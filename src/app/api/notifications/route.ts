import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api-proxy";

export async function GET(request: NextRequest) {
    // Target: GET /v1/notifications
    return proxyRequest(request, "/v1/notifications");
}
