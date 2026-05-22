import { getClientAndBucketFromRequest } from "@/lib/s3";
import { GetBucketCorsCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// GET: Fetch current CORS rules
export async function GET(request) {
    const { client: s3, bucket } = getClientAndBucketFromRequest(request);
    try {
        const command = new GetBucketCorsCommand({ Bucket: bucket });
        const data = await s3.send(command);
        return NextResponse.json({ rules: data.CORSRules || [] });
    } catch (error) {
        if (error.name === "NoSuchCORSConfiguration") {
            return NextResponse.json({ rules: [] });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Update CORS rules
export async function POST(request) {
    const { client: s3, bucket } = getClientAndBucketFromRequest(request);
    const { rules } = await request.json();

    try {
        const command = new PutBucketCorsCommand({
            Bucket: bucket,
            CORSConfiguration: {
                CORSRules: rules,
            },
        });

        await s3.send(command);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
