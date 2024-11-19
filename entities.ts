export interface Token {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter: string | null;
  telegram: string | null;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool: string | null;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  hidden: boolean | null;
  total_supply: number;
  website: string;
  show_name: boolean;
  last_trade_timestamp: number;
  king_of_the_hill_timestamp: number | null;
  market_cap: number;
  reply_count: number;
  last_reply: number;
  nsfw: boolean;
  market_id: string | null;
  inverted: boolean | null;
  is_currently_live: boolean;
  username: string;
  profile_image: string | null;
  usd_market_cap: number;
  totalTopHolderPercentage?: number;
  marketCapSol?: number;
}

export interface TokenEntity {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: "create" | "buy" | "sell";
  initialBuy: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
  name: string;
  symbol: string;
  uri: string;
  totalTopHolderPercentage: number;
  associated_bonding_curve: string;
}

export interface TokenUpdate extends TokenEntity {
  newTokenBalance: number;
  tokenAmount: number;
  timestamp: any;
}
