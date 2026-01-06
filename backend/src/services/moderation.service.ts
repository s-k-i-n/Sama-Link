import prisma from "../lib/prisma";

export class ModerationService {
  private readonly BAD_WORDS = ['badword', 'scam', 'spam', 'insulte', 'hate']; // Example list

  /**
   * Report a user
   */
  async reportUser(reporterId: string, reportedId: string, reason: string) {
    return prisma.report.create({
      data: {
        reporterId,
        reportedId,
        reason
      }
    });
  }

  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedId: string) {
    // 1. Create Block record
    const block = await prisma.block.create({
      data: {
        blockerId,
        blockedId
      }
    });

    // 2. Ideally, we should also dissolve any existing match/chat
    // Check if match exists
    const match = await prisma.match.findFirst({
        where: {
            OR: [
                { userAId: blockerId, userBId: blockedId },
                { userAId: blockedId, userBId: blockerId }
            ]
        }
    });

    if (match) {
        // Option A: Delete match
        // await prisma.match.delete({ where: { id: match.id } });
        
        // Option B: Set status to 'blocked' if we had such status, or just delete.
        // Let's delete for now to hide conversation.
        await prisma.match.delete({ where: { id: match.id } });
    }

    return block;
  }

  /**
   * Check content for violations
   * Returns true if safe, false if violation detected
   */
  checkContent(text: string): boolean {
    const lower = text.toLowerCase();
    for (const word of this.BAD_WORDS) {
      if (lower.includes(word)) return false;
    }
    return true;
  }
}

export const moderationService = new ModerationService();
