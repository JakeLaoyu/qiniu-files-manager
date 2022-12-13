<script setup lang="ts"></script>

<template>
  <div class="tool-bar">
    <a-select placeholder="Please select ...">
      <a-option>Beijing</a-option>
      <a-option>Shanghai</a-option>
      <a-option>Guangzhou</a-option>
    </a-select>
  </div>
</template>

<style scoped lang="scss">
.tool-bar {
  :deep(.arco-select) {
    width: 300px;
  }
}
</style>
