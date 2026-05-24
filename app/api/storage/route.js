// app/api/storage/route.js
import { getClientAndBucketFromRequest } from "@/lib/s3";
import {
    ListObjectsV2Command,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Helper function to recursively list ALL objects in bucket
async function listAllObjects({ client, bucket, prefix = "" }) {
    let allObjects = [];
    let continuationToken = null;

    do {
        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: continuationToken,
            MaxKeys: 1000,
        });

        const data = await client.send(command);

        if (data.Contents) {
            allObjects = allObjects.concat(data.Contents);
        }

        continuationToken = data.NextContinuationToken;
    } while (continuationToken);

    return allObjects;
}

// 1. GET: List Files & Folders with Pagination
export async function GET(request) {
    const { client: s3, bucket } = getClientAndBucketFromRequest(request);
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const includeAllStats = searchParams.get("includeAllStats") === "true";

    try {
        // Fetch all files for total stats (only if requested)
        let allFilesData = [];
        if (includeAllStats) {
            const allObjects = await listAllObjects({ client: s3, bucket });
            allFilesData = allObjects
                .filter((f) => !f.Key.endsWith("/"))
                .map((f) => ({
                    key: f.Key,
                    name: f.Key.split("/").pop(),
                    size: f.Size,
                    lastModified: f.LastModified,
                }));
        }

        // Regular folder listing (current folder only) — loop to handle truncation
        let allContents = [];
        let allCommonPrefixes = [];
        let folderContinuationToken = null;

        do {
            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                Delimiter: "/",
                MaxKeys: 1000,
                ContinuationToken: folderContinuationToken,
            });

            const data = await s3.send(command);

            if (data.Contents) {
                allContents = allContents.concat(data.Contents);
            }
            if (data.CommonPrefixes) {
                allCommonPrefixes = allCommonPrefixes.concat(data.CommonPrefixes);
            }

            folderContinuationToken = data.NextContinuationToken;
        } while (folderContinuationToken);

        // Extract Folders
        const folders = allCommonPrefixes.map((p) => ({
            name: p.Prefix,
            displayName: p.Prefix.replace(prefix, "").replace("/", ""),
        }));

        // Extract ALL Files (current folder only)
        const allCurrentFiles = await Promise.all(
            allContents
                .filter((f) => f.Key !== prefix && !f.Key.endsWith("/"))
                .map(async (f) => {
                    return {
                        key: f.Key,
                        name: f.Key.replace(prefix, ""),
                        size: f.Size,
                        lastModified: f.LastModified,
                        type: f.Key.split(".").pop().toLowerCase(),
                    };
                }),
        );

        // Calculate pagination
        const totalFiles = allCurrentFiles.length;
        const totalPages = Math.ceil(totalFiles / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Get paginated files and generate presigned URLs only for visible items
        const paginatedFiles = await Promise.all(
            allCurrentFiles.slice(startIndex, endIndex).map(async (f) => {
                const getCmd = new GetObjectCommand({ Bucket: bucket, Key: f.key });
                const url = await getSignedUrl(s3, getCmd, { expiresIn: 3600 });
                return { ...f, url };
            }),
        );

        return NextResponse.json({
            folders,
            files: paginatedFiles,
            allFiles: allFilesData,
            pagination: {
                currentPage: page,
                totalPages,
                totalFiles,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("❌ R2 CONNECTION ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 2. POST: Generate Presigned URL for Upload OR Bulk Delete
export async function POST(request) {
    const { client: s3, bucket } = getClientAndBucketFromRequest(request);
    const body = await request.json();

    // Handle bulk delete
    if (body.action === "bulk-delete") {
        const { keys } = body;

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            return NextResponse.json({ error: "No keys provided" }, { status: 400 });
        }

        try {
            const results = { deleted: [], errors: [] };

            // Process in chunks of 1000
            for (let i = 0; i < keys.length; i += 1000) {
                const chunk = keys.slice(i, i + 1000);

                const command = new DeleteObjectsCommand({
                    Bucket: bucket,
                    Delete: {
                        Objects: chunk.map((key) => ({ Key: key })),
                        Quiet: false,
                    },
                });

                const response = await s3.send(command);

                if (response.Deleted) {
                    results.deleted.push(...response.Deleted.map((d) => d.Key));
                }

                if (response.Errors) {
                    results.errors.push(
                        ...response.Errors.map((e) => ({
                            key: e.Key,
                            code: e.Code,
                            message: e.Message,
                        })),
                    );
                }
            }

            return NextResponse.json({
                success: true,
                deleted: results.deleted.length,
                errors: results.errors,
            });
        } catch (error) {
            console.error("Bulk delete error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // Original upload presigned URL generation
    const { filename, contentType } = body;

    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: filename,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 300 });
        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 3. DELETE: Remove a single file
export async function DELETE(request) {
    const { client: s3, bucket } = getClientAndBucketFromRequest(request);
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
        return NextResponse.json({ error: "No key provided" }, { status: 400 });
    }

    try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
