export interface KaspaFullTransactionsRequest {
  limit: string;
  resolve_previous_outpoints: string;
}

export type KaspaFullTransactionsResponse = KaspaTransaction[];

export type KaspaTransactionInput = {
  index: number;
  previous_outpoint_address: string;
  previous_outpoint_amount: number;
  previous_outpoint_hash: string;
  previous_outpoint_index: string;
  sig_op_count: string;
  signature_script: string;
  transaction_id: string;
}

export type KaspaTransactionOutput = {
  amount: number;
  index: number;
  script_public_key: string;
  script_public_key_address: string;
  script_public_key_type: string;
  transaction_id: string;
};

export type KaspaTransaction = {
  accepting_block_blue_score: number;
  accepting_block_hash: string;
  accepting_block_time: number;
  block_hash: string[];
  block_time: number;
  hash: string;
  inputs: KaspaTransactionInput[];
  is_accepted: boolean;
  mass: string;
  outputs: KaspaTransactionOutput[];
  payload: any;
  subnetwork_id: string;
  transaction_id: string;
  fee: number;
  amount: number;
}