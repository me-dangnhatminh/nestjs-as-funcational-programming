-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('local', 'google');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "owner_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3),
    "content_type" TEXT NOT NULL,
    "thumbnail" TEXT,
    "description" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_hierarchy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "owner_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3),
    "root_id" TEXT,
    "parent_id" TEXT,
    "depth" INTEGER NOT NULL,
    "lft" INTEGER NOT NULL,
    "rgt" INTEGER NOT NULL,

    CONSTRAINT "folder_hierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_in_folder" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,

    CONSTRAINT "file_in_folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_provider_id_key" ON "users"("email", "provider_id");

-- CreateIndex
CREATE INDEX "folder_hierarchy_lft_rgt_idx" ON "folder_hierarchy"("lft", "rgt");

-- CreateIndex
CREATE UNIQUE INDEX "file_in_folder_file_id_key" ON "file_in_folder"("file_id");

-- AddForeignKey
ALTER TABLE "folder_hierarchy" ADD CONSTRAINT "folder_hierarchy_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder_hierarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_hierarchy" ADD CONSTRAINT "folder_hierarchy_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "folder_hierarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_in_folder" ADD CONSTRAINT "file_in_folder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder_hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_in_folder" ADD CONSTRAINT "file_in_folder_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
