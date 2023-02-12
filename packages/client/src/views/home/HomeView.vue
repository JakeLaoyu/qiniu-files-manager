<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useBucketStore } from "@/stores/bucket";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import ToolBar from "./components/ToolBar.vue";

const bucketStore = useBucketStore();
const imagesStore = useImagesStore();

const { currentBucketInfo } = storeToRefs(bucketStore);
const { prefixsOpened } = storeToRefs(imagesStore);

const breadcrumbGo = (index: number) => {
  if (index === -1) {
    imagesStore.prefixsOpened = [];
  } else {
    imagesStore.prefixsOpened = prefixsOpened.value.slice(0, index + 1);
  }
};

onBeforeMount(async () => {
  if (currentBucketInfo.value) {
    await bucketStore.postSecret();

    await imagesStore.getList();
  }
});
</script>

<template>
  <div class="home">
    <a-breadcrumb class="home__breadcrumb">
      <a-breadcrumb-item
        class="home__breadcrumb-item"
        @click="breadcrumbGo(-1)"
      >
        首页
      </a-breadcrumb-item>

      <a-breadcrumb-item
        class="home__breadcrumb-item"
        v-for="(prefix, index) in prefixsOpened"
        :key="index"
        @click="breadcrumbGo(index)"
      >
        {{ prefix || "&nbsp;" }}
      </a-breadcrumb-item>
    </a-breadcrumb>

    <ToolBar></ToolBar>

    <div class="home__container">
      <div class="home__left">
        <QimUpload></QimUpload>

        <QimImageDetail></QimImageDetail>
      </div>

      <div class="home__right">
        <QimImagesList></QimImagesList>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  &__breadcrumb {
    margin-bottom: 10px;
  }

  :deep(.arco-breadcrumb-item) {
    cursor: pointer;
  }

  &__container {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 20px;
  }

  &__left {
    width: 350px;
    margin-right: 20px;
  }

  &__right {
    flex: 1;
  }
}
</style>
