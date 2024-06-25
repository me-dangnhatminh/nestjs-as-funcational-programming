-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "last_modified_at" TIMESTAMP,
    "archived_at" TIMESTAMP,
    "owner_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "thumbnail" TEXT,
    "description" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "archived_at" TIMESTAMP,
    "owner_id" TEXT NOT NULL,
    "root_id" TEXT,
    "depth" INTEGER NOT NULL,
    "lft" INTEGER NOT NULL,
    "rgt" INTEGER NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_folders" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,

    CONSTRAINT "file_folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folders_lft_rgt_idx" ON "folders"("lft", "rgt");

-- CreateIndex
CREATE UNIQUE INDEX "file_folders_file_id_key" ON "file_folders"("file_id");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_folders" ADD CONSTRAINT "file_folders_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_folders" ADD CONSTRAINT "file_folders_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
