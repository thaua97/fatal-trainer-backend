-- CreateTable
CREATE TABLE "admin_impersonation_logs" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "target_name" TEXT NOT NULL,
    "target_role" "UserRole" NOT NULL,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_impersonation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_impersonation_logs_admin_user_id_accessed_at_idx" ON "admin_impersonation_logs"("admin_user_id", "accessed_at" DESC);
