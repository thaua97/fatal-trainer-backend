-- CreateTable
CREATE TABLE "trainer_reviews" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_reviews_trainer_id_user_id_key" ON "trainer_reviews"("trainer_id", "user_id");

-- AddForeignKey
ALTER TABLE "trainer_reviews" ADD CONSTRAINT "trainer_reviews_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "personal_trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_reviews" ADD CONSTRAINT "trainer_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
