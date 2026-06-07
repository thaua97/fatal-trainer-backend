-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'personal-trainer', 'admin');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'in_review', 'resolved', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone_number" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "impersonator_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_trainers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "service_price" INTEGER NOT NULL,
    "contact_phone" TEXT,
    "rating" DOUBLE PRECISION,
    "review_count" INTEGER,
    "distance_km" DOUBLE PRECISION,
    "city" TEXT,
    "state" TEXT,
    "specialties" TEXT[],
    "modalities" TEXT[],
    "cref" TEXT,
    "gallery" TEXT[],
    "availability" TEXT,
    "experience_years" INTEGER,
    "reviews" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "promotion" JSONB,

    CONSTRAINT "personal_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","trainer_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "personal_trainers_user_id_key" ON "personal_trainers"("user_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_trainers" ADD CONSTRAINT "personal_trainers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "personal_trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
