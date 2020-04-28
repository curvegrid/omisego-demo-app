<!--
  This component is a div of several types of alerts
  (success green, error red, warning yellow) used throughout the
  app. By default, only success and error are shown.

  Sample Usage:
  <alert type="error"></alert>
-->

<template>
  <div>
    <custom-alert
      ref="infoAlert"
      type="info"
    />
    <custom-alert
      ref="successAlert"
      type="success"
    />
    <custom-alert
      ref="errorAlert"
      type="error"
    />
    <custom-alert
      ref="warningAlert"
      type="warning"
    />
  </div>
</template>

<script>
// Copyright (c) 2020 Curvegrid Inc.
import CustomAlert from './CustomAlert.vue';

export default {
  components: {
    CustomAlert,
  },
  props: {
    // Should other types of alerts be closed automatically when a type of alert is shown?
    replace: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    showInfo(message) {
      const { infoAlert } = this.$refs;
      if (this.replace) {
        this.hideAll();
      }
      infoAlert.showMessage(message);
    },
    showSuccess(message) {
      const { successAlert } = this.$refs;
      if (this.replace) {
        this.hideAll();
      }
      successAlert.showMessage(message);
    },
    showWarning(message) {
      const { warningAlert } = this.$refs;
      if (this.replace) {
        this.hideAll();
      }
      warningAlert.showMessage(message);
    },
    showError(message) {
      const { errorAlert } = this.$refs;
      if (this.replace) {
        this.hideAll();
      }
      errorAlert.showMessage(message);
    },
    // This also attempts to extract the error message from the JSON response.
    showErrorFromJSON(response) {
      const { errorAlert } = this.$refs;
      try {
        errorAlert.showMessage(response.response.data.message);
      } catch (e) {
        errorAlert.showMessage('An unspecified problem occurred, please try again');
      }
    },
    addInfo(messageArray) {
      const { infoAlert } = this.$refs;
      infoAlert.addMessage(messageArray);
    },
    addSuccess(messageArray) {
      const { successAlert } = this.$refs;
      successAlert.addMessage(messageArray);
    },
    addWarning(messageArray) {
      const { warningAlert } = this.$refs;
      warningAlert.addMessage(messageArray);
    },
    addError(messageArray) {
      const { errorAlert } = this.$refs;
      errorAlert.addMessage(messageArray);
    },
    hideAll() {
      const {
        infoAlert,
        successAlert,
        errorAlert,
        warningAlert,
      } = this.$refs;

      infoAlert.hideMessages();
      successAlert.hideMessages();
      errorAlert.hideMessages();
      warningAlert.hideMessages();
    },
  },
};
</script>
