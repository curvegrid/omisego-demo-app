<template>
  <div
    ref="container"
    class="vld-parent"
  >
    <v-form
      @submit.prevent="submit"
    >
      <v-text-field
        v-model="depositAmount"
        label="Amount"
        hint="uint256"
        persistent-hint
      />
      <load-select
        v-model="currency"
        :get-items="getCurrencies"
        label="Currency"
      />
      <v-text-field
        v-model="recipientAddress"
        label="Recipient"
        hint="address"
        persistent-hint
      />
      <v-text-field
        v-model="metadata"
        label="Metadata"
        hint="string"
        persistent-hint
      />
      <v-btn
        class="mt-4"
        type="submit"
      >
        Transact
      </v-btn>
    </v-form>
  </div>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
import { OmgUtil } from '@omisego/omg-js';
import LoadSelect from './LoadSelect.vue';

export default {
  name: 'Transact',
  components: {
    LoadSelect,
  },
  props: {
    childChain: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      depositAmount: '',
      currency: undefined,
      recipientAddress: '',
      metadata: '',
    };
  },
  methods: {
    submit() {
      this.$root.$emit('transact', this.$refs.container, this.depositAmount, this.currency, this.recipientAddress, this.metadata);
    },
    async getCurrencies() {
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();
      const utxos = await this.childChain.getUtxos(signerAddress);
      const allUtxoCurrencies = utxos.map((x) => x.currency);
      const uniqueCurrencies = [...new Set(allUtxoCurrencies)];
      const nested = uniqueCurrencies.map((x) => {
        let displayText = x;
        if (x === OmgUtil.transaction.ETH_CURRENCY) {
          displayText = 'Ether';
        }
        return { text: displayText, value: x };
      });
      return nested;
    },
  },
};
</script>
