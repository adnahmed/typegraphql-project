-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'farmer', 'expert');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(16) NOT NULL,
    "lastName" VARCHAR(16) NOT NULL,
    "email" domain_email,
    "mobilePhone" INTEGER,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobilePhone_key" ON "User"("mobilePhone");