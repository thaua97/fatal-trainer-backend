-- CreateTable
CREATE TABLE "promotion_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "starts_at" DATE NOT NULL,
    "ends_at" DATE NOT NULL,
    "max_redemptions" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_templates_pkey" PRIMARY KEY ("id")
);
