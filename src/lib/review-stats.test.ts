import { describe, expect, it } from "vitest";
import { approvedReviewStats } from "./review-stats";

describe("real approved reviews", () => {
  it("computes average and count only from approved database rows", () => {
    expect(approvedReviewStats([{ rating: 5, enabled: true }, { rating: 3, enabled: true }, { rating: 1, enabled: false }])).toEqual({ average: 4, count: 2 });
  });
  it("has no statistics to display when no approved reviews exist", () => {
    expect(approvedReviewStats([{ rating: 5, enabled: false }])).toEqual({ average: 0, count: 0 });
    expect(approvedReviewStats([])).toEqual({ average: 0, count: 0 });
  });
});