import { useQuery } from "@tanstack/react-query";
import {
  GetEscrowFromIndexerByContractIdsParams,
  useGetEscrowFromIndexerByContractIds,
} from "@trustless-work/escrow";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

/**
 * Use the query to get the escrows by contract ids
 *
 * @param params - The parameters for the query
 * @returns The query result
 */
export const useEscrowsByContractIdsQuery = ({
  contractIds,
  validateOnChain = false,
}: GetEscrowFromIndexerByContractIdsParams) => {
  // Get the escrow by contract ids
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();

  const hasContractIds = Boolean(contractIds && contractIds.length > 0);

  return useQuery({
    queryKey: ["escrows", "contract-ids", contractIds, validateOnChain],
    queryFn: async (): Promise<Escrow[]> => {
      if (!contractIds || contractIds.length === 0) {
        return [];
      }

      /**
       * Call the query to get escrows by contract ids from the Trustless Work Indexer
       *
       * @param params - The parameters for the query
       * @returns The query result
       */
      const escrows = await getEscrowByContractIds({
        contractIds,
        validateOnChain,
      });

      if (!escrows) {
        throw new Error("Failed to fetch escrows");
      }

      return escrows;
    },
    enabled: hasContractIds,
    staleTime: 1000 * 60 * 5,
  });
};
