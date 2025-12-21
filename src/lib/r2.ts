import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client
} from "@aws-sdk/client-s3"

import { env } from "@/env.mjs"

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_KEY_ID
  }
})

async function deleteObjectsWithPrefix(prefix: string) {
  let continuationToken: string | undefined

  do {
    const list = await R2.send(
      new ListObjectsV2Command({
        Bucket: env.R2_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    )

    const keys = list.Contents?.flatMap(item => (item.Key ? [item.Key] : []))

    if (keys && keys.length > 0) {
      await R2.send(
        new DeleteObjectsCommand({
          Bucket: env.R2_BUCKET_NAME,
          Delete: {
            Objects: keys.map(key => ({ Key: key }))
          }
        })
      )
    }

    continuationToken = list.NextContinuationToken
  } while (continuationToken)
}

export async function deleteOrganizationAssetsFromR2(organizationId: string) {
  await deleteObjectsWithPrefix(`orgs/${organizationId}/`)
}
