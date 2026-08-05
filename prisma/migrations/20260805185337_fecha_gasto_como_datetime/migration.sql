/*
  Warnings:

  - Changed the type of `fecha` on the `Gasto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Gasto" DROP COLUMN "fecha",
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL;
