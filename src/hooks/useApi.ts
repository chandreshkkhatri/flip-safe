'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get(url);
      const data = response.data;

      setState({
        data,
        loading: false,
        error: null,
      });

      onSuccess?.(data);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'An unexpected error occurred';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      onError?.(errorMessage);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [url, immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useApiMutation<TData = any, TVariables = any>() {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (
    url: string,
    variables?: TVariables,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
  ): Promise<TData | null> => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await axios({
        method,
        url,
        data: variables,
      });

      const data = response.data;

      setState({
        data,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'An unexpected error occurred';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

  return {
    ...state,
    mutate,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}
