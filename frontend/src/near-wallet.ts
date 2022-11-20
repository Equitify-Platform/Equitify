/* A helper file that simplifies using the wallet selector */

import { formatUnits } from "@ethersproject/units";
import {
  setupWalletSelector,
  WalletSelector,
  Wallet as W,
  Action,
} from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import MyNearIconUrl from "@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png";
import BN from "bn.js";
import { providers } from "near-api-js";
import "@near-wallet-selector/modal-ui/styles.css";
import type {
  AccountView,
  CodeResult,
} from "near-api-js/lib/providers/provider";

import { NATIVE_DECIMALS } from "./constants";

export const THIRTY_TGAS = "30000000000000";
export const NO_DEPOSIT = "0";

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
      modules: [setupMyNearWallet({ iconUrl: MyNearIconUrl })],
    });
    const isSignedIn = this.walletSelector.isSignedIn();
    if (isSignedIn) {
      this.wallet = await this.walletSelector.wallet();
      this.accountId =
        this.walletSelector.store.getState().accounts[0].accountId;
    }

    return isSignedIn;
  }

  // Sign-in method
  public signIn() {
    if (!this.walletSelector)
      throw new Error("Wallet selector is null or undefined.");

    const description = "Please select a wallet to sign in.";
    const modal = setupModal(this.walletSelector, {
      contractId: "",
      description,
    });
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

  public async getBalance() {
    if (!this.walletSelector)
      throw new Error("Wallet selector is null or undefined.");

    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const state = await provider.query<AccountView>({
      request_type: "view_account",
      account_id: this.accountId,
      finality: "optimistic",
    });
    const protocolConfig = await provider.experimental_protocolConfig({
      finality: "final",
    });
    const costPerByte = new BN(
      protocolConfig.runtime_config.storage_amount_per_byte
    );
    const stateStaked = new BN(state.storage_usage).mul(costPerByte);
    const staked = new BN(state.locked);
    const totalBalance = new BN(state.amount).add(staked);
    const availableBalance = totalBalance.sub(BN.max(staked, stateStaked));

    return {
      total: formatUnits(totalBalance.toString(), NATIVE_DECIMALS),
      stateStaked: formatUnits(stateStaked.toString(), NATIVE_DECIMALS),
      staked: formatUnits(staked.toString(), NATIVE_DECIMALS),
      available: formatUnits(availableBalance.toString(), NATIVE_DECIMALS),
    };
  }

  // Make a read-only call to retrieve information from the network
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public async view<T extends unknown = unknown>(
    contractId: string,
    method: string,
    args: Record<string, unknown> = {}
  ): Promise<T> {
    if (!this.walletSelector)
      throw new Error("Wallet selector is null or undefined.");

    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const result = await provider.query<CodeResult>({
      request_type: "call_function",
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      finality: "optimistic",
    });

    return JSON.parse(Buffer.from(result.result).toString()) as T;
  }

  // Call a method that changes the contract's state
  public async call(
    contractId: string,
    method: string,
    args: Record<string, unknown> = {},
    gas = THIRTY_TGAS,
    deposit = NO_DEPOSIT
  ) {
    if (!this.wallet || !this.accountId)
      throw new Error("Wallet or/and accountId is/are null or undefined.");

    // Sign a transaction with the "FunctionCall" action
    return await this.wallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: "FunctionCall",
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

  public async multicall(
    txs: {
      receiverId: string;
      actions: Action[];
    }[]
  ) {
    if (!this.wallet || !this.accountId)
      throw new Error("Wallet or/and accountId is/are null or undefined.");

    return await this.wallet.signAndSendTransactions({
      transactions: txs.map((tx) => ({
        ...tx,
        signerId: this.accountId ?? "",
      })),
    });
  }

  // Get transaction result from the network
  public async getTransactionResult(txHash: string) {
    if (!this.walletSelector)
      throw new Error("Wallet selector is null or undefined.");
    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txHash, "unnused");
    return providers.getTransactionLastResult(transaction);
  }
}
