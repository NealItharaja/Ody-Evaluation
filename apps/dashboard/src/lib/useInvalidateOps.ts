import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCustomersQueryKey,
  getGetMenuQueryKey,
  getGetOrdersQueryKey,
  getGetSettingsQueryKey,
  getGetSummaryQueryKey,
} from '@ody/api-client';

/** After any write, refresh the surfaces that depend on that data. */
export function useInvalidateOps() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
  };
}
