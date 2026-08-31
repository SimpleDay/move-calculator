# Backup Concept

## Overview

Backups of the database and assets are done nightly using Github Actions. The backup action can also be triggered manually.

Assets are copied using a transfer job from the application bucket to the backup bucket.

The backup bucket has the following properties:

- it uses a different region (europe-west1 vs europe-west3)
- it has a retention policy (files cannot be modified for the first 9 days)
- it has a lifecycle policy (files are automatically deleted after 10 days)

Currently, the retention policy is not locked. This would protect the bucket from deletion or disabling the retention policy. This might be an improvement in the future.

Each backup is assigned an id (date and time of creation) and has subfolders for each object that is backed up (e.g: `assets` and `sql`).

A weekly action copies the newest backup to another location (Wasabi s3 bucket).

Here similar retention and lifecycle policies are enforced (70 days).

## Restore

When restoring a backup we do not override production data. This data might be needed for further analysis after the incident.

Create new resources as restoration targets:

- Create a new application bucket and add policies for the application service account to access the new bucket

```shell
PROJECT_ID="INSERT PROJECT ID HERE"
BUCKET_NAME="NAME OF THE NEW BUCKET"
REGION_APP="europe-west3"
ENV="production"
APPLICATION_SHORT="web"

SA_NAME="sa-$APPLICATION_SHORT-$ENV"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
# set project
gcloud config set project "$PROJECT_ID"

# create new bucket
gcloud storage buckets create "gs://$BUCKET_NAME" --location "$REGION_APP" --public-access-prevention --uniform-bucket-level-access

# add policies
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" --member="serviceAccount:$SA_EMAIL" --role="roles/storage.objectUser"
```

- Create a new database branch
- Use the restore Github Action to restore a backup into the new resources.
- Update the Vercel environment variables (`DATABASE_URL` and `BUCKET_NAME`)
- Redeploy the Vercel App
