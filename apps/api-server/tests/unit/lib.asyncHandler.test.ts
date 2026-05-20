import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../src/lib/asyncHandler";
import { HttpError } from "../../src/middlewares/errorHandler";

describe("asyncHandler", () => {
  it("forwards resolved handlers without calling next", async () => {
    const fn = vi.fn(async (_req, res) => {
      res.status(200).json({ ok: true });
    });
    const handler = asyncHandler(fn);
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    handler({} as Request, res, next);
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(fn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards rejected promises to next", async () => {
    const err = new HttpError(418, "teapot");
    const handler = asyncHandler(async () => {
      throw err;
    });
    const next = vi.fn() as NextFunction;

    await new Promise<void>((resolve) => {
      handler({} as Request, {} as Response, (e) => {
        expect(e).toBe(err);
        resolve();
      });
    });

    expect(next).not.toHaveBeenCalled();
  });
});
