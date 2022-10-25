import { parseUnits } from "@ethersproject/units";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";

import { NATIVE_DECIMALS } from "../constants";
import { Wallet, THIRTY_TGAS } from "../near-wallet";

export class Launchpad {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async nft(): Promise<string> {
    return this.wallet.view<string>(this.contractId, "l_nft");
  }

  public async ft(): Promise<string> {
    return this.wallet.view<string>(this.contractId, "l_ft");
  }

  public async purchaseTokens(
    beneficiary: string,
    token_id: string,
    amount: string
  ): Promise<void | FinalExecutionOutcome> {
    return await this.wallet.call(
      this.contractId,
      "purchaseTokens",
      { beneficiary, token_id },
      THIRTY_TGAS,
      parseUnits(amount, NATIVE_DECIMALS).toString()
    );
  }

  public async claimVestedTokens(
    beneficiary: string,
    token_id: string
  ): Promise<void | FinalExecutionOutcome> {
    return await this.wallet.call(this.contractId, "claimVestedTokens");
  }
}
