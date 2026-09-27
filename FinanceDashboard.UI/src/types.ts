export interface Account {
  id: number;
  name: string;
  currency: string;
  balance: number;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  description?: string;
  category: string;
  date: string;
  type: string;
}