<!--
  This componenet is a wrapper for a v-alert that can take
  one or more messages.
  The type (success, error, warning, info) can be specified.

  Sample Usage:
  <custom-alert type="success"></custom-alert>
-->

<template>
  <div>
    <v-alert
      :type="type"
      :value="messages.length != 0"
    >
      <div style="display:flex; justify-content:space-between;">
        <div>
          <p
            v-for="(message, index) in messages"
            :key="index"
            class="mb-0"
          >
            {{ message }}
          </p>
        </div>
        <a class="v-alert__dismissible">
          <v-icon
            @click="hideMessages()"
          >
            mdi-close
          </v-icon>
        </a>
      </div>
    </v-alert>
  </div>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
export default {
  name: 'CustomAlert',
  props: {
    type: {
      type: String,
      default: undefined,
      required: true,
    },
  },
  data() {
    return {
      messages: [],
    };
  },
  methods: {
    showMessage(message) {
      if (message != null) {
        this.messages = [message];
      }
    },
    addMessage(message) {
      if (message != null) {
        this.messages = this.messages.concat(message);
      }
    },
    hideMessages() {
      this.messages = [];
    },
  },
};
</script>
