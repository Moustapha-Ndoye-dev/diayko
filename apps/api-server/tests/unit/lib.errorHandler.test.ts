import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { HttpError, errorHandler } from "../../src/middlewares/errorHandler";

function runErrorHandler(err: unknown) {
  const req = { log: { error: vi.fn() }, originalUrl: "/api/test" };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();
  errorHandler(err, req as never, res as never, next);
  return { req, res, next };
}

describe("HttpError", () => {
  it("stores status and optional details", () => {
    const e = new HttpError(422, "bad", { field: "x" });
    expect(e.status).toBe(422);
    expect(e.message).toBe("bad");
    expect(e.details).toEqual({ field: "x" });
  });
});

describe("errorHandler", () => {
  it("maps ZodError to 400 with issues", () => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: "nope" });
    if (parsed.success) throw new Error("expected failure");

    const { res } = runErrorHandler(parsed.error);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation failed",
        issues: expect.arrayContaining([
          expect.objectContaining({ path: "email" }),
        ]),
      }),
    );
  });

  it("maps HttpError to its status code", () => {
    const { res } = runErrorHandler(new HttpError(409, "Conflict"));
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Conflict" });
  });

  it("maps unknown errors to 500", () => {
    const { res } = runErrorHandler(new Error("boom"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
