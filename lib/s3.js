import { S3Client } from "@aws-sdk/client-s3";

const R2_ENDPOINT = `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT || R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

export function createS3ClientFromCredentials({ accountId, accessKeyId, secretAccessKey }) {
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    return new S3Client({
        region: "auto",
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
    });
}

export function getClientAndBucketFromRequest(request) {
    const accountId = request.headers.get("x-r2-account-id");
    const accessKeyId = request.headers.get("x-r2-access-key-id");
    const secretAccessKey = request.headers.get("x-r2-secret-access-key");
    const bucketName = request.headers.get("x-r2-bucket-name");

    if (accountId && accessKeyId && secretAccessKey && bucketName) {
        return {
            client: createS3ClientFromCredentials({ accountId, accessKeyId, secretAccessKey }),
            bucket: bucketName,
        };
    }

    return {
        client: s3Client,
        bucket: process.env.R2_BUCKET_NAME,
    };
}
