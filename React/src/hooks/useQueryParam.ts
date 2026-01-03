import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useQueryParam(
  key: string,
  defaultValue: string
): [string, (newValue: string | null | undefined) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    return searchParams.get(key) || defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue === null || newValue === undefined) {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, key, router]
  );

  return [value, setValue];
}
