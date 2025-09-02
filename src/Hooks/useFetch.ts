import { useState, useEffect } from "react";
import axios from "axios";

export function useFetch<T>(url: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<T>(url);
        if (isMounted) setData(response.data);
      } catch (err) {
        if (isMounted) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred");
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, isLoading, error };
}
