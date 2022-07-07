import { closeCurrentWindow } from '@app/background';
import { AccountabilityStep, AccountabilityStore, AppConfig, DrawerContext, RpcStore } from '@app/popup/modules/shared';
import { Logger } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { makeAutoObservable } from 'mobx';
import { ChangeEvent } from 'react';
import { injectable } from 'tsyringe';

@injectable()
export class ManageAccountViewModel {
  name = this.accountability.currentAccount?.name ?? '';
  drawer!: DrawerContext;

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private logger: Logger,
    private config: AppConfig,
  ) {
    makeAutoObservable<ManageAccountViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
      logger: false,
      config: false,
    });
  }

  get isVisible(): boolean {
    if (this.accountability.currentAccount) {
      return this.accountability.accountsVisibility[this.accountability.currentAccount.tonWallet.address];
    }

    return false;
  }

  get isActive(): boolean {
    return this.accountability.currentAccount?.tonWallet.address === this.accountability.selectedAccount?.tonWallet.address;
  }

  get linkedKeys() {
    const publicKey = this.accountability.currentAccount?.tonWallet.publicKey;
    const address = this.accountability.currentAccount?.tonWallet.address;
    const storedKeys = this.accountability.storedKeys;

    const keys = Object.values(storedKeys).filter(
      (key) => key.publicKey === publicKey,
    );

    const externalAccount = this.accountability.externalAccounts.find(
      (account) => account.address === address,
    );

    if (externalAccount !== undefined) {
      keys.push(
        ...externalAccount.externalIn
          .map((key) => storedKeys[key])
          .filter((e) => e),
      );
    }

    return keys;
  }

  get currentAccount(): nt.AssetsList | undefined {
    return this.accountability.currentAccount;
  }

  get isSaveVisible(): boolean {
    return !!this.currentAccount &&
      !!(this.currentAccount.name || this.name) &&
      this.currentAccount.name !== this.name;
  }

  handleNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.name = e.target.value;
  };

  saveName = async () => {
    if (this.accountability.currentAccount && this.name) {
      await this.rpcStore.rpc.renameAccount(this.accountability.currentAccount.tonWallet.address, this.name);
      this.accountability.setCurrentAccount({ ...this.accountability.currentAccount, name: this.name });
    }
  };

  onSelectAccount = async () => {
    if (this.accountability.currentMasterKey?.masterKey == null) {
      return;
    }

    await this.rpcStore.rpc.selectMasterKey(this.accountability.currentMasterKey.masterKey);

    if (!this.accountability.currentAccount) {
      return;
    }

    await this.rpcStore.rpc.updateAccountVisibility(this.accountability.currentAccount.tonWallet.address, true);
    await this.rpcStore.rpc.selectAccount(this.accountability.currentAccount.tonWallet.address);

    this.accountability.reset();
    this.drawer.setPanel(undefined);

    if (this.config.activeTab?.type === 'notification') {
      await closeCurrentWindow();
    }
  };

  onManageDerivedKey = (key: nt.KeyStoreEntry) => this.accountability.onManageDerivedKey(key);

  onToggleVisibility = async () => {
    if (this.accountability.currentAccount && !this.isActive) {
      await this.rpcStore.rpc.updateAccountVisibility(
        this.accountability.currentAccount.tonWallet.address,
        !this.isVisible,
      );
    }
  };

  onBack = () => {
    this.accountability.setStep(AccountabilityStep.MANAGE_DERIVED_KEY);
    this.accountability.setCurrentAccount(undefined);
  };
}
