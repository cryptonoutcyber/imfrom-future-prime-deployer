import fetch from 'node-fetch';
import { PublicKey } from '@solana/web3.js';

export type HeliusRpcUrl = string; // e.g. https://mainnet.helius-rpc.com/?api-key=XXXX

export interface GetProgramAccountsV2Params {
  programId: string; // base58
  commitment?: 'processed' | 'confirmed' | 'finalized';
  encoding?: 'base64' | 'base58' | 'jsonParsed';
  dataSlice?: { offset: number; length: number };
  filters?: Array<
    | { memcmp: { offset: number; bytes: string } }
    | { dataSize: number }
  >;
  // Helius extension for pagination
  paginationToken?: string | null;
  limit?: number;
}

export interface GetProgramAccountsV2ResultAccount {
  pubkey: string;
  account: {
    lamports: number;
    data: [string, 'base64'] | any; // depends on encoding
    owner: string;
    executable: boolean;
    rentEpoch: number;
    space?: number;
  };
}

export interface GetProgramAccountsV2Response {
  jsonrpc: '2.0';
  id: string | number;
  result?: {
    accounts: GetProgramAccountsV2ResultAccount[];
    paginationKey?: string;
    count?: number;
  };
  error?: { code: number; message: string };
}

export async function heliusGetProgramAccountsV2(
  rpcUrl: HeliusRpcUrl,
  params: GetProgramAccountsV2Params,
): Promise<GetProgramAccountsV2Response> {
  const body = {
    jsonrpc: '2.0',
    id: '1',
    method: 'getProgramAccounts',
    // Helius v2 accepts extended params
    params: [{
      ...params,
      programId: new PublicKey(params.programId).toBase58(),
    }],
  };

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Helius RPC error: HTTP ${res.status}`);
  }

  const json = (await res.json()) as GetProgramAccountsV2Response;
  if (json.error) {
    throw new Error(`Helius RPC error ${json.error.code}: ${json.error.message}`);
  }
  return json;
}

export interface PaginatedFetchOptions {
  rpcUrl: HeliusRpcUrl;
  programId: string;
  limitPerPage?: number;
  filters?: GetProgramAccountsV2Params['filters'];
  commitment?: GetProgramAccountsV2Params['commitment'];
  onPage?: (page: GetProgramAccountsV2ResultAccount[], pageIndex: number) => Promise<void> | void;
}

export async function fetchAllProgramAccountsPaginated(options: PaginatedFetchOptions) {
  const {
    rpcUrl,
    programId,
    limitPerPage = 1000,
    filters,
    commitment = 'confirmed',
    onPage,
  } = options;

  let paginationToken: string | undefined;
  let pageIndex = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await heliusGetProgramAccountsV2(rpcUrl, {
      programId,
      commitment,
      encoding: 'base64',
      filters,
      limit: limitPerPage,
      paginationToken: paginationToken ?? null,
    });

    const accounts = resp.result?.accounts ?? [];
    if (onPage) await onPage(accounts, pageIndex);

    const next = resp.result?.paginationKey;
    if (!next || accounts.length === 0) break;

    paginationToken = next;
    pageIndex += 1;
  }
}
