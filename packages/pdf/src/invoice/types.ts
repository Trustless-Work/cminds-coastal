export type TaskInvoiceSettlementType = "released" | "resolved";

export type TaskInvoicePayee = {
  address: string;
  amount?: number;
  label?: string;
};

export type TaskInvoiceData = {
  logoDataUrl?: string;
  escrow: {
    title: string;
    communityName?: string;
    contractId: string;
    engagementId?: string;
    geographicArea?: string;
    assetSymbol: string;
  };
  task: {
    code: string;
    category?: string;
    name: string;
    deliverable?: string;
    milestoneIndex: number;
  };
  payment: {
    amount: number;
    settlementType: TaskInvoiceSettlementType;
    payees: TaskInvoicePayee[];
    generatedAt: Date;
  };
  roles?: {
    releaseSigner?: string;
    approver?: string;
    disputeResolver?: string;
  };
  footer: {
    networkLabel: string;
    disclaimer?: string;
  };
};
