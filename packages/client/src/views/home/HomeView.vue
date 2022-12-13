<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useBucketStore } from "@/stores/bucket";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import ToolBar from "./components/ToolBar.vue";

const bucketStore = useBucketStore();
const imagesStore = useImagesStore();

const { currentBucketInfo } = storeToRefs(bucketStore);

onBeforeMount(async () => {
  if (currentBucketInfo.value) {
    await bucketStore.postSecret({
      accessKey: currentBucketInfo.value.AccessKey,
      secretKey: currentBucketInfo.value.SecretKey,
    });

    await imagesStore.getList();
  }
});
</script>

<template>
  <div class="home">
    <ToolBar></ToolBar>
  </div>
</template>
