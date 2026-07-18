"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  checkUsdcDestination,
  type DestinationCheck,
} from "../services/stellar-account.service";

/**
 * Debounced on-chain validation of a withdrawal destination. Only hits Horizon
 * once the input settles, and never for an empty value.
 */
export function useDestinationCheck(address: string) {
  const [debounced, setDebounced] = useState(address.trim());

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(address.trim()), 400);
    return () => clearTimeout(handle);
  }, [address]);

  const query = useQuery<DestinationCheck>({
    queryKey: ["withdraw", "destination-check", debounced],
    queryFn: () => checkUsdcDestination(debounced),
    enabled: debounced.length > 0,
    retry: false,
    staleTime: 15_000,
  });

  const settled = debounced === address.trim();

  return { ...query, settled, debounced };
}
