-- CreateTable
CREATE TABLE "KbArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "views" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "KbArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condTicketType" TEXT,
    "condPriority" TEXT,
    "condStatus" TEXT,
    "condUnassigned" BOOLEAN NOT NULL DEFAULT false,
    "action" TEXT NOT NULL,
    "actionValue" TEXT,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KbArticle" ADD CONSTRAINT "KbArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
