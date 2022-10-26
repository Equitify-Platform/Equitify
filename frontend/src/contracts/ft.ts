import { Wallet } from "../near-wallet";

interface FtContractMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

export class FungibleToken {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async metadata(): Promise<FtContractMetadata> {
    return await this.wallet.view<FtContractMetadata>(
      this.contractId,
      "ft_metadata"
    );
  }

  public async balanceOf(address: string): Promise<string> {
    return await this.wallet.view(this.contractId, "ft_balance_of", {
      account_id: address,
    });
  }

  public async totalSupply(): Promise<string> {
    return await this.wallet.view<string>(this.contractId, "ft_total_supply");
  }
}
