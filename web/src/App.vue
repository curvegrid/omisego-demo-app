<template>
  <v-app>
    <omisego />
  </v-app>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
import { ethers } from 'ethers';
import Omisego from './Omisego.vue';

export default {
  components: {
    Omisego,
  },
  data() {
    return {

    };
  },
  async created() {
    // If MetaMask's privacy mode is enabled, we must get the user's permission
    // in order to be able to access their signers
    if (window.ethereum != null) { // true if user is using MetaMask
      await window.ethereum.enable();
    }
  },
  beforeMount() {
    this.$root.$_web3 = new ethers.providers.Web3Provider(window.web3.currentProvider);
  },
};
</script>
