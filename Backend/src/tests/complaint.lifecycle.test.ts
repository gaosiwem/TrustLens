import { assertTransition } from "../modules/complaints/complaint.lifecycle.js";
import { ComplaintStatus } from "@prisma/client";

describe("Complaint lifecycle", () => {
  it("allows valid transitions", () => {
    expect(() =>
      assertTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW)
    ).not.toThrow();
  });

  it("blocks invalid transitions", () => {
    expect(() =>
      assertTransition(ComplaintStatus.RESOLVED, ComplaintStatus.SUBMITTED)
    ).toThrow();
  });
});
