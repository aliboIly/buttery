import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOtpFlow } from "./use-otp-flow.ts";
import type {
  OtpFlowOptions,
  RequestCodeResult,
  VerifyResult,
} from "./use-otp-flow.ts";

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
    ],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

function flow(
  options: Partial<OtpFlowOptions<{ readonly user: string }>> = {},
) {
  return renderHook(() =>
    useOtpFlow<{ readonly user: string }>({
      onRequestCode: () => ({ ok: true, expiresIn: 600 }),
      onVerify: (_identifier, code) =>
        code === "123456"
          ? { ok: true, session: { user: "rosa" } }
          : { ok: false, reason: "wrong" },
      ...options,
    }),
  );
}

async function sendTo(
  result: { readonly current: ReturnType<typeof useOtpFlow> },
  identifier: string,
): Promise<void> {
  act(() => {
    result.current.setIdentifier(identifier);
  });
  await act(async () => {
    await result.current.sendCode();
  });
}

describe("useOtpFlow", () => {
  it("sends a code and moves to the code step, saying where it went and how long it lasts", async () => {
    const onRequestCode = vi.fn<(identifier: string) => RequestCodeResult>(
      () => ({
        ok: true,
        expiresIn: 600,
      }),
    );
    const { result } = flow({ onRequestCode });
    expect(result.current.step).toBe("identify");
    await sendTo(result, "(215) 910-5473");
    expect(onRequestCode).toHaveBeenCalledWith("(215) 910-5473");
    expect(result.current.step).toBe("code");
    expect(result.current.destination).toBe("••• ••• 5473");
    expect(result.current.expiresIn).toBe(600);
    expect(result.current.resendIn).toBe(30);
  });

  it("counts down to a new code, then sends one and starts again", async () => {
    const onRequestCode = vi.fn<(identifier: string) => RequestCodeResult>(
      () => ({
        ok: true,
      }),
    );
    const { result } = flow({ onRequestCode, resendAfter: 3 });
    await sendTo(result, "rosa@cafe.com");
    await act(async () => {
      await result.current.resend();
    });
    expect(onRequestCode).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.resendIn).toBe(2);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.resendIn).toBe(0);
    await act(async () => {
      await result.current.resend();
    });
    expect(onRequestCode).toHaveBeenCalledTimes(2);
    expect(result.current.resendIn).toBe(3);
  });

  it("says what to do next when a code can't be sent, a failed call included", async () => {
    const { result } = flow({
      onRequestCode: () => ({ ok: false, reason: "rate-limited" }),
    });
    await sendTo(result, "rosa@cafe.com");
    expect(result.current.step).toBe("identify");
    expect(result.current.requestError).toBe(
      "Too many codes asked for. Wait a minute, then try again.",
    );
    const failing = flow({
      onRequestCode: () => Promise.reject(new Error("offline")),
    });
    await sendTo(failing.result, "rosa@cafe.com");
    expect(failing.result.current.requestError).toBe(
      "The code couldn't be sent. Check your connection and try again.",
    );
  });

  it("checks a full code once, shows success, then hands the session on after the hold", async () => {
    const onVerify = vi.fn<
      (
        identifier: string,
        code: string,
      ) => VerifyResult<{ readonly user: string }>
    >(() => ({ ok: true, session: { user: "rosa" } }));
    const onSuccess = vi.fn();
    const { result } = flow({ onVerify, onSuccess });
    await sendTo(result, "rosa@cafe.com");
    await act(async () => {
      await Promise.all([
        result.current.verify("123456"),
        result.current.verify("123456"),
      ]);
    });
    expect(onVerify).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("success");
    act(() => {
      vi.advanceTimersByTime(799);
    });
    expect(onSuccess).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith({ user: "rosa" });
    await act(async () => {
      await result.current.verify("123456");
    });
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it("clears a wrong code and says what to do, and ignores one that isn't full", async () => {
    const onVerify = vi.fn<
      (
        identifier: string,
        code: string,
      ) => VerifyResult<{ readonly user: string }>
    >(() => ({ ok: false, reason: "expired" }));
    const { result } = flow({ onVerify });
    await sendTo(result, "rosa@cafe.com");
    await act(async () => {
      await result.current.verify("123");
    });
    expect(onVerify).not.toHaveBeenCalled();
    act(() => {
      result.current.setCode("999999");
    });
    await act(async () => {
      await result.current.verify("999999");
    });
    expect(result.current.status).toBe("error");
    expect(result.current.code).toBe("");
    expect(result.current.codeError).toBe(
      "That code has expired. Send a new one.",
    );
  });

  it("goes back with the identifier still filled in", async () => {
    const { result } = flow();
    await sendTo(result, "rosa@cafe.com");
    act(() => {
      result.current.back();
    });
    expect(result.current.step).toBe("identify");
    expect(result.current.identifier).toBe("rosa@cafe.com");
  });
});
