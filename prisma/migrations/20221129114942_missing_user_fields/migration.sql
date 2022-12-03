/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "address" VARCHAR(100) NOT NULL,
ADD COLUMN     "country" CHAR(2) NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "region" VARCHAR(30) NOT NULL,
ADD COLUMN     "roles" "Role"[],
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);
