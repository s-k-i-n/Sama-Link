-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_confession_id_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_confession_id_fkey";

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_confession_id_fkey" FOREIGN KEY ("confession_id") REFERENCES "Confession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_confession_id_fkey" FOREIGN KEY ("confession_id") REFERENCES "Confession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
