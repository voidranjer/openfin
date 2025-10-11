export type FireflyTransaction = {
  type: "withdrawal" | "deposit";
  description: string;
  category_name: string;
  amount: number;
  date: string;
  external_id: string;
  notes?: string | null;
  source_name?: string | null;
  destination_name?: string | null;
};