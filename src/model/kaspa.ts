export type TransactionInput = {
    index: number;
    previous_outpoint_address: string;
    previous_outpoint_amount: number;
    previous_outpoint_hash: string;
    previous_outpoint_index: string;
    sig_op_count: string;
    signature_script: string;
    transaction_id: string;
}

export type TransactionOutput = {
    amount: number;
    index: number;
    script_public_key: string;
    script_public_key_address: string;
    script_public_key_type: string;
    transaction_id: string;
};

export type Transaction = {
    accepting_block_blue_score: number;
    accepting_block_hash: string;
    accepting_block_time: number;
    block_hash: string[];
    block_time: number;
    hash: string;
    inputs: TransactionInput[];
    is_accepted: boolean;
    mass: string;
    outputs: TransactionOutput[];
    payload: any; // 可以改为 `null` 或具体类型
    subnetwork_id: string;
    transaction_id: string;
    fee: number;
    amount: number;
}