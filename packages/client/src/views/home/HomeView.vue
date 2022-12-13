<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useBucketStore } from "@/stores/bucket";
import { storeToRefs } from "pinia";
import ToolBar from "./components/ToolBar.vue";

const bucketStore = useBucketStore();

const { currentBucketInfo } = storeToRefs(bucketStore);

onBeforeMount(() => {
  if (currentBucketInfo.value) {
    bucketStore.postSecret({
      accessKey: currentBucketInfo.value.AccessKey,
      secretKey: currentBucketInfo.value.SecretKey,
    });
  }
});
</script>

<template>
  <div class="home">
    <ToolBar></ToolBar>
  </div>
</template>
