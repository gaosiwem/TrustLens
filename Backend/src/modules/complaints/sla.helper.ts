import { addHours } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to calculate deadline
export async function calculateSLADeadline(
  brandId: string,
  urgency: number = 5,
): Promise<Date> {
  const config = await prisma.brandSLAConfig.findUnique({ where: { brandId } });

  let hours = 24; // Default medium

  // Urgency 0-10 scale
  if (urgency >= 8) {
    hours = config?.highPriorityHours || 4;
  } else if (urgency >= 5) {
    hours = config?.mediumPriorityHours || 24;
  } else {
    hours = config?.lowPriorityHours || 48;
  }

  return addHours(new Date(), hours);
}
