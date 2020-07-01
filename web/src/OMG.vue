<template>
  <v-container>
    <v-card class="mb-3">
      <v-container fluid>
        <v-layout wrap>
          <v-flex shrink>
            <h1 class="primary--text">
              OMG Network Helper
            </h1>
          </v-flex>
        </v-layout>
        <v-divider class="mt-2 mb-2" />
        <v-layout wrap>
          <v-flex
            shrink
            xs12
          >
            <v-text-field
              v-model="plasmaFrameworkDeployedAddress"
              label="PlasmaFramework Contract Address"
              disabled
            />
            <v-text-field
              v-model="ethVaultDeployedAddress"
              label="EthVault Contract Address"
              disabled
            />
            <v-text-field
              v-model="erc20VaultDeployedAddress"
              label="Erc20Vault Contract Address"
              disabled
            />
            <v-text-field
              v-model="paymentExitGameDeployedAddress"
              label="PaymentExitGame Contract Address"
              disabled
            />
            <v-text-field
              v-model="watcherUrl"
              label="Child Chain Watcher URL"
              disabled
            />
          </v-flex>
        </v-layout>
      </v-container>
      <status-alerts ref="topAlert" />
    </v-card>
    <v-card
      v-if="loadComplete"
      class="mb-3"
    >
      <v-tabs
        v-model="currentTabIndex"
        grow
      >
        <v-tabs-slider color="accent" />

        <v-tab ripple>
          Deposit
        </v-tab>
        <v-tab ripple>
          Transact
        </v-tab>
        <v-tab ripple>
          Withdraw
        </v-tab>
        <v-tabs-items v-model="currentTabIndex">
          <v-tab-item>
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Deposit Ether
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <eth-deposit />
                </v-expansion-panel-content>
                <status-alerts ref="depositEthAlert" />
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Deposit ERC20
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <erc20-deposit />
                </v-expansion-panel-content>
                <status-alerts ref="depositErc20Alert" />
              </v-expansion-panel>
            </v-expansion-panels>
          </v-tab-item>
          <v-tab-item>
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Transact
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <transact :child-chain="childChain" />
                </v-expansion-panel-content>
                <status-alerts ref="transactAlert" />
              </v-expansion-panel>
            </v-expansion-panels>
          </v-tab-item>
          <v-tab-item>
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Withdraw
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <withdraw :child-chain="childChain" />
                </v-expansion-panel-content>
                <status-alerts ref="withdrawAlert" />
              </v-expansion-panel>
            </v-expansion-panels>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </v-card>
    <v-card
      v-if="loadComplete"
    >
      <v-container>
        <v-layout wrap>
          <v-flex shrink>
            <h3 class="primary--text">
              Balance
            </h3>
          </v-flex>
        </v-layout>
        <v-divider class="mt-2 mb-2" />
        <div
          ref="balanceContainer"
          class="vld-parent"
        >
          <v-text-field
            v-model="inputAddress"
            label="Address"
            append-outer-icon="mdi-magnify"
            @click:append-outer="checkBalance"
          />
          <v-text-field
            v-model="rootChainBalance"
            label="Root Chain Balance (Wei)"
            readonly
          />
          <v-text-field
            v-model="childChainBalance"
            label="OMG Network Balance (Wei)"
            readonly
          />
        </div>
      </v-container>
      <status-alerts ref="balanceAlert" />
    </v-card>
  </v-container>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
import axios from 'axios';
import BigNumber from 'bn.js';
import { OmgUtil, ChildChain } from '@omisego/omg-js';
import EthDeposit from './components/EthDeposit.vue';
import Erc20Deposit from './components/Erc20Deposit.vue';
import Transact from './components/Transact.vue';
import Withdraw from './components/Withdraw.vue';
import StatusAlerts from './components/StatusAlerts.vue';

export default {
  components: {
    EthDeposit,
    Erc20Deposit,
    Transact,
    Withdraw,
    StatusAlerts,
  },
  data() {
    return {
      ethVaultDeployedAddress: '',
      erc20VaultDeployedAddress: '',
      paymentExitGameDeployedAddress: '',
      plasmaFrameworkDeployedAddress: '',
      watcherUrl: 'https://watcher-info.ropsten.v1.omg.network',
      childChain: null,
      inputAddress: '',
      rootChainBalance: '',
      childChainBalance: '',
      currentTabIndex: 0,
      ethVaultContract: {},
      erc20VaultContract: {},
      paymentExitGameContract: {},
      plasmaFrameworkContract: {},
      loadComplete: false,
      standardExitBondSize: 0,
      baseUrl: 'http://localhost:3000',
      ethVaultLabel: 'ethvault',
      erc20VaultLabel: 'erc20vault',
      paymentExitGameLabel: 'paymentexitgame',
      plasmaFrameworkLabel: 'plasmaframework',
    };
  },
  async created() {
    this.childChain = new ChildChain({ watcherUrl: this.watcherUrl });
  },
  beforeMount() {
    this.$root.$off('eth-deposit');
    this.$root.$off('erc20-deposit');
    this.$root.$off('transact');
    this.$root.$off('withdraw');
    this.$root.$on('eth-deposit', (container, amount) => this.depositEth(container, amount));
    this.$root.$on('erc20-deposit', (container, amount, erc20ContractAddress) => this.depositErc20(container, amount, erc20ContractAddress));
    this.$root.$on('transact', (container, amount, currency, recipientAddress, metadata) => this.transact(container, amount, currency, recipientAddress, metadata));
    this.$root.$on('withdraw', (container, utxo) => this.withdraw(container, utxo));
  },
  async mounted() {
    if (this.$root.$_web3 == null) {
      this.$refs.topAlert.addError('Web3 not found');
    }
    await this.setContracts();
    await this.setDeployedAddresses();
    await this.setStandardExitBondSize();
    this.loadComplete = true;
  },
  methods: {
    async setContracts() {
      try {
        this.ethVaultContract = await this.getContract(this.ethVaultLabel, '1.0');
        this.erc20VaultContract = await this.getContract(this.erc20VaultLabel, '1.0');
        this.paymentExitGameContract = await this.getContract(this.paymentExitGameLabel, '1.0');
        this.plasmaFrameworkContract = await this.getContract(this.plasmaFrameworkLabel, '1.0');
      } catch (error) {
        this.$refs.topAlert.addError('Failed to retrieve contracts. Please confirm that the proxy backend is running, the API key is correct, and that the contracts are uploaded to MultiBaas');
      }
    },
    async setDeployedAddresses() {
      try {
        this.ethVaultDeployedAddress = this.ethVaultContract.instances[0].address;
        this.erc20VaultDeployedAddress = this.erc20VaultContract.instances[0].address;
        this.paymentExitGameDeployedAddress = this.paymentExitGameContract.instances[0].address;
        this.plasmaFrameworkDeployedAddress = this.plasmaFrameworkContract.instances[0].address;
      } catch (error) {
        this.$refs.topAlert.addError('Failed to get deployed addresses. Please ensure that the OMG contracts are linked to their Ropsten addresses on MultiBaas');
      }
    },
    async setStandardExitBondSize() {
      try {
        const defaultExitBondSize = await this.getStateVariable(this.paymentExitGameLabel, this.paymentExitGameDeployedAddress, 'startStandardExitBondSize');
        this.standardExitBondSize = parseInt(defaultExitBondSize.output, 10);
      } catch (error) {
        this.$refs.topAlert.addError('Failed to get standard exit bond size');
      }
    },
    async depositEth(container, amount) {
      const alertRef = this.$refs.depositEthAlert;
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();
      let depositTx;
      try {
        depositTx = this.createDepositRLP(signerAddress, amount, OmgUtil.transaction.ETH_CURRENCY);
      } catch (error) {
        alert.addError(error);
        return;
      }
      const params = {
        args: [depositTx],
        from: signerAddress,
        signer: signerAddress,
        value: amount,
      };
      await this.callMethod(this.ethVaultLabel, this.ethVaultDeployedAddress, 'deposit', params, container, alertRef);
    },
    async depositErc20(container, amount, erc20ContractAddress) {
      const alert = this.$refs.depositErc20Alert;
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();
      let depositTx;
      try {
        depositTx = this.createDepositRLP(signerAddress, amount, erc20ContractAddress);
      } catch (error) {
        alert.addError(error);
        return;
      }
      const params = {
        args: [depositTx],
        from: signerAddress,
        signer: signerAddress,
      };
      await this.callMethod(this.erc20VaultLabel, this.erc20VaultDeployedAddress, 'deposit', params, container, alert);
    },
    async transact(container, amount, currency, recipientAddress, metadata) {
      const txMetadata = metadata || OmgUtil.transaction.NULL_METADATA;
      const alert = this.$refs.transactAlert;
      alert.hideAll();
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();

      const payments = [{
        owner: recipientAddress,
        currency,
        amount: Number(amount),
      }];

      const fee = {
        currency: OmgUtil.transaction.ETH_CURRENCY,
      };

      const loader = this.$loading.show({ container });
      try {
        const createdTxn = await this.childChain.createTransaction({
          owner: signerAddress,
          payments,
          fee,
          txMetadata,
        });

        const typedData = OmgUtil.transaction.getTypedData(createdTxn.transactions[0],
          this.plasmaFrameworkDeployedAddress);

        let signature;
        try {
          signature = await this.$root.$_web3.send(
            'eth_signTypedData_v3',
            [signerAddress, JSON.stringify(typedData)],
            signerAddress,
          );
        } catch (error) {
          alert.addError(error.message);
          loader.hide();
          return;
        }

        const inputCount = createdTxn.transactions[0].inputs.length;
        const signatures = Array(inputCount).fill(signature);

        const signedTx = this.childChain.buildSignedTransaction(typedData, signatures);

        const transactionReceipt = await this.childChain.submitTransaction(signedTx);
        alert.addSuccess(`Transaction hash: ${transactionReceipt.txhash}`);
        alert.addSuccess(`Block number: ${transactionReceipt.blknum}`);
        alert.addSuccess(`Transaction index: ${transactionReceipt.txindex}`);
      } catch (error) {
        console.warn(error);
        alert.addError('Failed to send OMG Network transaction. Please see the console for details.');
      }
      loader.hide();
    },
    async withdraw(container, utxo) {
      const alert = this.$refs.withdrawAlert;
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();
      let exitData;
      let params;
      try {
        exitData = await this.childChain.getExitData(utxo);
        params = {
          args: [[exitData.utxo_pos, `${exitData.txbytes}`, `${exitData.proof}`]],
          from: signerAddress,
          signer: signerAddress,
          value: this.standardExitBondSize,
        };
      } catch (error) {
        alert.addError('Failed to get exit data');
        return;
      }
      await this.callMethod(this.paymentExitGameLabel, this.paymentExitGameDeployedAddress, 'startStandardExit', params, container, alert);
    },
    async checkBalance() {
      const container = this.$refs.balanceContainer;
      const loader = this.$loading.show({ container });
      try {
        const balanceArray = await this.childChain.getBalance(this.inputAddress);
        this.rootChainBalance = await this.$root.$_web3.getBalance(this.inputAddress);
        this.childChainBalance = `${balanceArray.length === 0 ? 0 : balanceArray[0].amount}`;
      } catch (error) {
        this.$refs.balanceAlert.addError('Failed to get balance');
      }
      loader.hide();
    },
    async getContract(contractLabel, version) {
      let url;
      if (version) {
        url = `${this.baseUrl}/api/v0/contracts/${contractLabel}/${version}`;
      } else {
        url = `${this.baseUrl}/api/v0/contracts/${contractLabel}`;
      }
      const response = await axios.get(url);
      return response.data.result;
    },
    async getStateVariable(contractLabel, deployedAddress, variableName) {
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();
      const url = `${this.baseUrl}/api/v0/chains/ethereum/addresses/${deployedAddress}/contracts/${contractLabel}/methods/${variableName}`;
      const response = await axios({
        method: 'POST',
        credentials: 'same-origin',
        url,
        data: { args: [], from: signerAddress },
      });

      const { data: { result } } = response;
      return result;
    },
    async callMethod(contractLabel, deployedAddress, functionName, params, container, alertRef) {
      alertRef.hideAll();
      const loader = this.$loading.show({ container });
      const url = `${this.baseUrl}/api/v0/chains/ethereum/addresses/${deployedAddress}/contracts/${contractLabel}/methods/${functionName}`;
      try {
        const response = await axios({
          method: 'POST',
          credentials: 'same-origin',
          url,
          data: params,
        });

        const { data: { result } } = response;

        const { tx, submitted } = result;
        let txHash = tx.hash;
        if (!submitted) {
          const signer = this.$root.$_web3.getSigner(tx.from);
          const ethersTx = this.$root.$_cgutils.formatEthersTx(tx);
          let txResponse;
          try {
            txResponse = await signer.sendTransaction(ethersTx);
          } catch (error) {
            alertRef.addError(error.message);
            loader.hide();
            return;
          }
          txHash = txResponse.hash;
          alertRef.addSuccess(`Transaction hash: ${txHash}`);
        }
        await this.waitForTransactionConfirmation(txHash, alertRef);
      } catch (error) {
        alertRef.addError(error.response.data.message);
      }
      loader.hide();
    },
    async waitForTransactionConfirmation(txHash, alertRef) {
      const txReceipt = await this.$root.$_cgutils
        .waitForTransactionReceipt(this.$root.$_web3, txHash);

      alertRef.addSuccess('Transaction confirmed');
      if (txReceipt.contractAddress != null) {
        alertRef.addSuccess(`Contract Address: ${txReceipt.contractAddress}`);
      }
      alertRef.addSuccess(`Block number: ${txReceipt.blockNumber}`);
      alertRef.addSuccess(`Gas used: ${txReceipt.gasUsed}`);
    },
    createDepositRLP(address, amount, currency) {
      if (amount === '') {
        throw new Error('Amount must be specified');
      }
      try {
        const depositTransaction = OmgUtil.transaction.encodeDeposit(address,
          new BigNumber(amount),
          currency);
        return depositTransaction;
      } catch (error) {
        throw new Error(`Failed to encode deposit transaction for currency ${currency}`);
      }
    },
  },
};
</script>
