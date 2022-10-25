import { Wallet } from "../near-wallet";

export class FungibleToken {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async name(): Promise<string> {
    return await this.wallet.view<string>(this.contractId, "ft_name");
  }

  public async symbol(): Promise<string> {
    return await this.wallet.view<string>(this.contractId, "ft_symbol");
  }

  public async decimals(): Promise<string> {
    return await this.wallet.view<string>(this.contractId, "ft_decimals");
  }

  public async totalSupply(): Promise<string> {
    return await this.wallet.view<string>(this.contractId, "ft_total_supply");
  }
}
