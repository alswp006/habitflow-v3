import { describe, it, expect } from "vitest";
import { LOCAL_ONLY_MVP, throwIfApiCalled } from "@/lib/api/localOnly";

describe("localOnly module (packet-0004)", () => {
  it("should export LOCAL_ONLY_MVP constant as true", () => {
    expect(LOCAL_ONLY_MVP).toBe(true);
  });

  it("throwIfApiCalled should throw with LocalOnlyMvpError name", () => {
    expect(() => throwIfApiCalled("test-feature")).toThrow();

    try {
      throwIfApiCalled("test-feature");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).name).toBe("LocalOnlyMvpError");
    }
  });

  it("throwIfApiCalled should include feature name in error message", () => {
    const feature = "cloud-sync";

    try {
      throwIfApiCalled(feature);
      expect.fail("Should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain(feature);
      expect((error as Error).message).toContain("network");
    }
  });

  it("should have no side effects on import", () => {
    // Verify that just importing the module doesn't cause any errors
    // and that the constants are accessible
    expect(LOCAL_ONLY_MVP).toBe(true);
    expect(typeof throwIfApiCalled).toBe("function");
  });

  it("throwIfApiCalled should work with various feature names", () => {
    const features = ["user-profile", "sync-backup", "cloud-storage"];

    features.forEach((feature) => {
      try {
        throwIfApiCalled(feature);
        expect.fail(`Should have thrown for ${feature}`);
      } catch (error) {
        expect((error as Error).name).toBe("LocalOnlyMvpError");
        expect((error as Error).message).toContain(feature);
      }
    });
  });
});
