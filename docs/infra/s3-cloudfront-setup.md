# S3 + CloudFront — setup de assets

Guia para configurar armazenamento de imagens da galeria e foto de perfil dos personal trainers.

## Visão geral

```
Browser → Fastify API (multipart) → S3 PutObject
Browser → CloudFront (GET) ← S3 bucket (OAC, sem acesso público direto)
```

Variáveis no backend (`STORAGE_DRIVER=s3`):

| Variável | Exemplo |
|----------|---------|
| `AWS_REGION` | `us-east-1` |
| `AWS_S3_BUCKET` | `fatal-trainer-assets-prod` |
| `CDN_BASE_URL` | `https://d123abc.cloudfront.net` |
| `AWS_ACCESS_KEY_ID` | (dev local; em prod use IAM role) |
| `AWS_SECRET_ACCESS_KEY` | (dev local) |

Object keys: `trainers/{trainerId}/{uuid}.{ext}`

---

## 1. Bucket S3

1. Crie o bucket (ex.: `fatal-trainer-assets-prod`) na região desejada.
2. **Block Public Access**: mantenha **habilitado** (acesso somente via CloudFront OAC).
3. Versioning: opcional (recomendado em prod).
4. CORS (para evolução futura com presigned URLs):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["https://seu-dominio.com", "http://localhost:3333"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Ou use o script:

```bash
./scripts/setup-s3-cors.sh fatal-trainer-assets-prod us-east-1 cors.json
```

---

## 2. CloudFront

1. Crie uma **Origin Access Control (OAC)** para o bucket.
2. Crie a distribution com:
   - **Origin**: bucket S3 + OAC
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed methods**: GET, HEAD
   - **Cache policy**: CachingOptimized (objetos com `Cache-Control: public, max-age=31536000, immutable`)
3. Anote o domínio da distribution → `CDN_BASE_URL`.

### Bucket policy (OAC)

Substitua `BUCKET`, `ACCOUNT_ID`, `DISTRIBUTION_ID`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

---

## 3. IAM — permissões da API

Policy mínima para a role/user que executa o backend:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::fatal-trainer-assets-prod/trainers/*"
    }
  ]
}
```

Em ECS/EC2/Lambda, anexe a policy à **task/instance role** e omita `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` no `.env`.

---

## 4. Backend

```bash
STORAGE_DRIVER=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=fatal-trainer-assets-prod
CDN_BASE_URL=https://d123abc.cloudfront.net
```

Desenvolvimento local continua com `STORAGE_DRIVER=local` (padrão).

---

## 5. Checklist pós-deploy

- [ ] Upload via `POST /api/personal-trainers/me/gallery` retorna URL com `CDN_BASE_URL`
- [ ] Imagem acessível via GET no CloudFront
- [ ] Delete remove objeto do S3 (`DELETE .../gallery/:index`)
- [ ] Capa sincroniza `users.avatar_url` (`PATCH .../gallery/cover`)

---

## Referências

- [AWS SDK v3 — S3 PutObject](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/PutObjectCommand/)
- [CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
