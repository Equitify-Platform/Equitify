import { THIRTY_TGAS, Wallet } from "../near-wallet";

export interface TokenData {
  tokenId: string;
  tokenURI: string;
  balance: string;
  released: string;
  revoked: boolean;
  initialized: boolean;
  claimed: boolean;
}

export interface TokenMetadata {
  title?: string;
  description?: string;
  media?: string;
  media_hash?: string;
  copies?: number;
  issued_at?: string;
  expires_at?: string;
  starts_at?: string;
  updated_at?: string;
  extra?: string;
  reference?: string;
  reference_hash?: string;
}

export interface JsonToken {
  token_id: string;
  owner_id: string;
  metadata: TokenMetadata;
  approved_account_ids: { [accountId: string]: number };
  royalty: { [accountId: string]: number };
}

export interface LaunchpadJsonToken {
  token_data?: TokenData;
  token?: JsonToken;
}

export class NonFungibleToken {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async transferNft(receiver_id: string, token_id: string) {
    return this.wallet.call(
      this.contractId,
      "nft_transfer",
      {
        receiver_id,
        token_id,
      },
      THIRTY_TGAS,
      "1"
    );
  }

  public async nftTokensDetailedForOwner(
    account_id: string
  ): Promise<LaunchpadJsonToken[]> {
    return this.wallet.view<LaunchpadJsonToken[]>(
      this.contractId,
      "nft_tokens_detailed_for_owner",
      {
        account_id,
      }
    );
  }
}
