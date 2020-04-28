// Copyright (c) 2020 Curvegrid Inc.
import { utils } from 'ethers';

export default {
  install: (Vue) => {
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$_cgutils = {
      // formatEthersTx is used to prepare transactions received from the MultiBaas API
      // for submission on the frontend by ethers.js
      // This helper renames the gas field to gasLimit, and deletes some fields that
      // prevent ethers.js from being able to submit the transaction
      formatEthersTx(txFromAPI) {
        const tx = JSON.parse(JSON.stringify(txFromAPI));
        tx.gasLimit = tx.gas;
        tx.gasPrice = utils.bigNumberify(tx.gasPrice);
        tx.value = utils.bigNumberify(tx.value);
        delete tx.gas;
        delete tx.from;
        delete tx.hash;
        return tx;
      },
      // In production we must wait for the transaction to be mined before we can
      // retrieve the transaction receipt. This is a helper function
      // that will repeatedly try to fetch the transaction receipt for up to ~ one minute.
      // Beware: if the caller enters an invalid transaction response hash, this function
      // will spin wait for ~ one minute and subsequently return null
      async waitForTransactionReceipt(web3, txResponseHash) {
        let txReceipt = null;
        const maxSecondsToWait = 120;
        /* eslint-disable no-await-in-loop */
        for (let i = 0; i < maxSecondsToWait; i += 1) {
          txReceipt = await web3.getTransactionReceipt(txResponseHash);
          if (txReceipt == null) {
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            break;
          }
        }
        /* eslint-enable no-await-in-loop */
        return txReceipt;
      },
    };
  },
};
