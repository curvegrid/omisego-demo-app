<template>
  <v-select
    v-model="selection"
    :items="items"
    :label="label"
    append-outer-icon="mdi-refresh"
    v-bind="$attrs"
    @click:append-outer="getAndSetItems"
  />
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
export default {
  name: 'LoadSelect',
  components: {
  },
  props: {
    value: {
      type: null,
      default: () => ({}),
    },
    label: {
      type: String,
      required: true,
    },
    getItems: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      items: [],
      selection: {},
    };
  },
  watch: {
    selection() {
      this.$emit('input', this.selection);
    },
  },
  mounted() {
    this.getAndSetItems();
  },
  methods: {
    async getAndSetItems() {
      this.items = await this.getItems();
    },
  },
};
</script>
