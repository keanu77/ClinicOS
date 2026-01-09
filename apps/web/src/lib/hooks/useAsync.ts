import { useState, useCallback, useEffect, useRef } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
}

/**
 * 統一的非同步狀態管理 Hook
 * @param asyncFunction 非同步函數
 * @param options 選項 - immediate: 是否立即執行
 * @returns { data, loading, error, execute, reset }
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
      throw err;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute().catch(() => {});
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.data && !state.error,
    isSuccess: !state.loading && state.data !== null && !state.error,
    isError: !state.loading && state.error !== null,
  };
}

/**
 * 帶依賴項的非同步 Hook
 * 當依賴項改變時自動重新執行
 */
export function useAsyncEffect<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction();
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, deps);

  return state;
}
