import BN from "bn.js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";

import { Wallet, THIRTY_TGAS } from "../near-wallet";

interface IdoData {
  members: string;
  staticMembers: string;
  antagonistMembers: string;
  dynamicMembers: string;
  launchpadMembers: string;
  totalClaimableAmount: string;
  totalPurchased: string;
  totalNearAmount: string;
  start: string;
  cliff: string;
  duration: string;
  totalVestingAmount: string;
  totalUnreleased: string;
}

interface Project {
  hardCap: string;
  softCap: string;
  saleStartTime: string;
  saleEndTime: string;
  price: string;
  projectName: string;
  projectDescription: string;
  projectSignatures: string;
}

interface GetIdoDataResult {
  project: Project;
  idoData: IdoData;
  nftContract: string;
  idoToken: string;
}

export class Launchpad {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async getIdoInfo(): Promise<GetIdoDataResult> {
    return this.wallet.view<GetIdoDataResult>(this.contractId, "get_ido_info");
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
      new BN(THIRTY_TGAS).muln(10).toString(),
      amount,
    );
  }

  public async claimVestedTokens(
    beneficiary: string,
    token_id: string
  ): Promise<void | FinalExecutionOutcome> {
    return await this.wallet.call(this.contractId, "claimVestedTokens");
  }
}
