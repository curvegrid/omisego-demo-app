<template>
  <div
    ref="container"
    class="vld-parent"
  >
    <v-form
      @submit.prevent="submit"
    >
      <load-select
        v-model="utxo"
        :get-items="getUtxos"
        label="UTXO To Exit"
      />
      <v-btn
        class="mt-4"
        type="submit"
      >
        Start Standard Exit
      </v-btn>
    </v-form>
  </div>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
import { OmgUtil } from '@omisego/omg-js';
import LoadSelect from './LoadSelect.vue';

export default {
  name: 'Withdraw',
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
      utxo: undefined,
    };
  },
  methods: {
    submit() {
      this.$root.$emit('withdraw', this.$refs.container, this.utxo);
    },
    async getUtxos() {
      const signer = await this.$root.$_web3.getSigner(0);
      const signerAddress = await signer.getAddress();
      const utxos = await this.childChain.getUtxos(signerAddress);
      const nested = utxos.map((x) => ({ text: this.formatUtxoText(x), value: x }));
      return nested;
    },
    formatUtxoText(utxo) {
      let { currency } = utxo;
      let amount;
      if (utxo.currency === OmgUtil.transaction.ETH_CURRENCY) {
        currency = 'ETH';
      }
      if (utxo.amount) {
        amount = utxo.amount.toString(10);
      }
      return `${currency} ${amount}`;
    },
  },
};
</script>
