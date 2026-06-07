#!/usr/bin/env bash
set -euo pipefail

BUCKET="${1:?Usage: setup-s3-cors.sh BUCKET REGION CORS_JSON_FILE}"
REGION="${2:?Usage: setup-s3-cors.sh BUCKET REGION CORS_JSON_FILE}"
CORS_FILE="${3:?Usage: setup-s3-cors.sh BUCKET REGION CORS_JSON_FILE}"

aws s3api put-bucket-cors \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --cors-configuration "file://${CORS_FILE}"

echo "CORS applied to s3://${BUCKET}"
