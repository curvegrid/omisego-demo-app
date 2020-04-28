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
        label="Amount in wei"
        hint="uint256"
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
  name: 'EthDeposit',
  data() {
    return {
      depositAmount: '',
    };
  },
  methods: {
    submit() {
      this.$root.$emit('eth-deposit', this.$refs.container, this.depositAmount);
    },
  },
};
</script>
