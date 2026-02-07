import { describe, it, expect } from "@jest/globals";
import { prisma } from "../lib/prisma.js";
import { resolveBrand } from "../modules/brands/brand.service.js";

describe("Domain Hint Logic", () => {
  it("should prioritize a regional TLD when a domain hint is provided", async () => {
    const brandName = "Vodacom";
    const domainHint = "vodacom.co.za";

    // Clear existing brand if any
    await prisma.brand.deleteMany({ where: { name: brandName } });

    // Call resolveBrand with the .co.za hint
    const brand = await resolveBrand(
      brandName,
      false,
      undefined,
      undefined,
      domainHint,
    );
    expect(brand).toBeDefined();

    // Wait for the async part
    let updatedBrand = null;
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updatedBrand = await prisma.brand.findUnique({
        where: { id: (brand as any).id },
      });
      if (updatedBrand?.logoUrl) break;
    }

    console.log("Found Logo URL:", updatedBrand?.logoUrl);
    // It should contain vodacom.co.za if the hint worked, rather than just .com
    expect(updatedBrand?.logoUrl).toContain("vodacom.co.za");
  }, 15000);
});
