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

    <div class="home__container">
      <div class="home__left">
        <a-upload draggable action="/" />
      </div>

      <div class="home__right">
        <QimImagesList></QimImagesList>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  &__container {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 20px;
  }

  &__left {
    width: 300px;
    margin-right: 20px;
  }

  &__right {
    flex: 1;
  }
}
</style>
