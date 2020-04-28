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
        label="Number of tokens"
        hint="uint256"
        persistent-hint
      />
      <v-text-field
        v-model="erc20ContractAddress"
        label="ERC20 Token Contract Address"
        hint="address"
        persistent-hint
      />
      <v-btn
        class="mt-4"
        type="submit"
      >
        Deposit
      </v-btn>
    </v-form>
  </div>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
export default {
  name: 'Erc20Deposit',
  data() {
    return {
      depositAmount: '',
      erc20ContractAddress: '',
    };
  },
  methods: {
    submit() {
      this.$root.$emit('erc20-deposit', this.$refs.container, this.depositAmount, this.erc20ContractAddress);
    },
  },
};
</script>
