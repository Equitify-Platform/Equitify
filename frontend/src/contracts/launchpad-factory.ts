import { Wallet } from "../near-wallet";

export class LaunchpadFactory {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async getLaunchpads(): Promise<string[]> {
    return await this.wallet.view<string[]>(
      this.contractId,
      "get_all_idos_info"
    );
  }
}
