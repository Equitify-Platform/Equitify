/* A helper file that simplifies using the wallet selector */

// near api js
import { providers } from 'near-api-js';
import type { CodeResult } from 'near-api-js/lib/providers/provider';

// wallet selector UI
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';

// wallet selector options
import { setupWalletSelector, WalletSelector, Wallet as W } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

export class Wallet {
    private walletSelector: WalletSelector | null = null;
    private wallet: W | null = null;
    private readonly network: "mainnet" | "testnet";
    public accountId?: string | null;

    constructor(network?: "mainnet" | "testnet") {
        this.network = network || "testnet";
    }

    public async startUp(): Promise<boolean> {
        this.walletSelector = await setupWalletSelector({
            network: this.network,
            modules: [
                setupMyNearWallet({ iconUrl: MyNearIconUrl }),
            ],
        });
        const isSignedIn = this.walletSelector.isSignedIn();
        if (isSignedIn) {
            this.wallet = await this.walletSelector.wallet();
            this.accountId = this.walletSelector.store.getState().accounts[0].accountId;
        }

        return isSignedIn;
    }

    // Sign-in method
    public signIn() {
        if (!this.walletSelector) throw new Error("Wallet selector is null or undefined.");

        const description = 'Please select a wallet to sign in.';
        const modal = setupModal(this.walletSelector, { contractId: "", description });
        modal.show();
    }

    // Sign-out method
    public async signOut(): Promise<void> {
        if (this.wallet) {
            await this.wallet.signOut();
        }
        this.wallet = this.accountId = null;
        window.location.replace(window.location.origin + window.location.pathname);
    }

    // Make a read-only call to retrieve information from the network
    public async view<T extends unknown = unknown>(contractId: string, method: string, args: Record<string, unknown> = {}): Promise<T> {
        if (!this.walletSelector) throw new Error("Wallet selector is null or undefined.");

        const { network } = this.walletSelector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
        const result = await provider.query<CodeResult>({
            request_type: 'call_function',
            account_id: contractId,
            method_name: method,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
            finality: 'optimistic',
        });

        return JSON.parse(Buffer.from(result.result).toString()) as T;
    }

    // Call a method that changes the contract's state
    public async call(contractId: string, method: string, args: Record<string, unknown> = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT) {
        if (!this.wallet  || !this.accountId) throw new Error("Wallet or/and accountId is/are null or undefined.");

        // Sign a transaction with the "FunctionCall" action
        return await this.wallet.signAndSendTransaction({
            signerId: this.accountId,
            receiverId: contractId,
            actions: [
                {
                    type: 'FunctionCall',
                    params: {
                        methodName: method,
                        args,
                        gas,
                        deposit,
                    },
                },
            ],
        });
    }

    // Get transaction result from the network
    public async getTransactionResult(txHash: string) {
        if (!this.walletSelector) throw new Error("Wallet selector is null or undefined.");
        const { network } = this.walletSelector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

        // Retrieve transaction result from the network
        const transaction = await provider.txStatus(txHash, 'unnused');
        return providers.getTransactionLastResult(transaction);
    }
}