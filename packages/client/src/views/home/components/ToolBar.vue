<script setup lang="ts">
import { useBucketStore } from "@/stores/bucket";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";

const bucketStore = useBucketStore();
const imagesStore = useImagesStore();

const { buckets, curBucketId } = storeToRefs(bucketStore);
const { newPrefix } = storeToRefs(imagesStore);
</script>

<template>
  <div class="tool-bar">
    <a-select v-model="curBucketId" placeholder="Please select ...">
      <a-option v-for="value in buckets" :key="value.id" :value="value.id">
        {{ value.bucket }}
      </a-option>
    </a-select>

    <a-input v-model="newPrefix" placeholder="添加前缀" allow-clear />
  </div>
</template>

<style scoped lang="scss">
.tool-bar {
  :deep(.arco-select) {
    width: 200px;
  }

  :deep(.arco-input-wrapper) {
    width: 200px;
    margin-left: 10px;
  }
}
</style>
