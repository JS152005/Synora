-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "StudyPartnerRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPartnerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPartnerRequest_senderId_idx" ON "StudyPartnerRequest"("senderId");

-- CreateIndex
CREATE INDEX "StudyPartnerRequest_receiverId_idx" ON "StudyPartnerRequest"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPartnerRequest_senderId_receiverId_key" ON "StudyPartnerRequest"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "StudyPartnerRequest" ADD CONSTRAINT "StudyPartnerRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPartnerRequest" ADD CONSTRAINT "StudyPartnerRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
