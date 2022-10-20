import type { Wallet } from "../near-wallet";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";

export class HelloNear {
    private readonly contractId: string;
    private readonly wallet: Wallet;

    constructor(contractId: string, wallet: Wallet) {
        this.contractId = contractId;
        this.wallet = wallet;
    }

    public async getGreeting(): Promise<string> {
        return await this.wallet.view<string>(this.contractId, "get_greeting");
    }

    public async setGreeting(greeting: string): Promise<void | FinalExecutionOutcome> {
        return await this.wallet.call(this.contractId, "set_greeting", { message: greeting });
    }
}