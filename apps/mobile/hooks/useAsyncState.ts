import { useState, useEffect, useCallback } from "react";
import { AsyncState } from "@/types";

export function useAsyncState<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): [AsyncState<T>, () => Promise<void>] {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  const execute = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetcher();
      setState({ status: "success", data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setState({ status: "error", message });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return [state, execute];
}
