export interface Category {
  category_id: number;
  category: string;
}

export interface Transaction {
  transaction_id: number;
  amount: number;
  description: string | null;
  category_id: number;
  category?: string; // Joined category name
  reimbursed_amount?: number; // Sum of reimbursements
  datetime: string;
  source: string;
}

export interface Reimbursement {
  reimbursement_id: number;
  amount: number;
  transaction_id: number;
  description: string | null;
  datetime: string;
  source: string | null;
}
export interface DescriptionMapping {
  description: string;
  category: string;
}

export interface SourceMapping {
  reference: string;
  source: string;
}
