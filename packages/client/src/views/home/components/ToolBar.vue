<script setup lang="ts">
import { useBucketStore } from "@/stores/bucket";
import { storeToRefs } from "pinia";

const bucketStore = useBucketStore();

const { buckets, curBucketId } = storeToRefs(bucketStore);
</script>

<template>
  <div class="tool-bar">
    <a-select v-model="curBucketId" placeholder="Please select ...">
      <a-option v-for="value in buckets" :key="value.id" :value="value.id">
        {{ value.bucket }}
      </a-option>
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
