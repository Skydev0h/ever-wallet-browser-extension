import { closeCurrentWindow } from '@app/background';
import { Loader, useViewModel } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { PrepareMessage } from '../PrepareMessage';
import { SendPageViewModel } from './SendPageViewModel';

export const SendPage = observer((): JSX.Element | null => {
  const vm = useViewModel(SendPageViewModel);

  if (!vm.selectedAccount || !vm.tonWalletState) return null;

  if (!vm.initialSelectedAsset) {
    return <Loader />;
  }

  return (
    <PrepareMessage
      defaultAsset={vm.initialSelectedAsset}
      onBack={closeCurrentWindow}
    />
  );
});
