-- AlterTable
ALTER TABLE "User" ADD COLUMN     "children" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "drinking" TEXT,
ADD COLUMN     "education_level" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "school" TEXT,
ADD COLUMN     "smoking" TEXT,
ADD COLUMN     "zodiac_sign" TEXT;

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "user_id" TEXT NOT NULL,
    "interest_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("user_id","interest_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
