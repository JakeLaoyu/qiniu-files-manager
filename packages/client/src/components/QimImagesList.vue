<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { useElementBounding, useWindowSize } from "@vueuse/core";
import { useBucketStore } from "@/stores/bucket";

const bucketStore = useBucketStore();
const imagesStore = useImagesStore();
const listHeight = ref(0);

const listRef = ref<HTMLElement>();

const { imagesList, prefixs, listLoading, prefixsOpened } =
  storeToRefs(imagesStore);

const { currentBucketInfo } = storeToRefs(bucketStore);

watch(
  () => prefixsOpened.value,
  () => {
    imagesStore.getList();
  }
);

watch(
  () => currentBucketInfo.value,
  () => {
    imagesStore.setPrefixs([]);
    imagesStore.getList();
  }
);

const prefixsFormat = computed(() =>
  prefixs.value.map((item) => {
    return {
      key: item,
      mimeType: "folder",
    };
  })
);

const listData = computed(() => {
  const back = prefixsOpened.value.length
    ? [{ key: "返回上一级", mimeType: "back" }]
    : [];

  return [...back, ...prefixsFormat.value, ...imagesList.value];
});

const computedListMaxHeight = () => {
  const { height } = useWindowSize();
  const { top: listTop } = useElementBounding(listRef);
  console.log("listTop", listTop.value);

  listHeight.value = height.value - listTop.value;
};

onMounted(() => {
  nextTick(() => {
    computedListMaxHeight();
  });
});
</script>

<template>
  <a-spin class="spin" dot :loading="listLoading">
    <a-list
      ref="listRef"
      :max-height="listHeight"
      :virtualListProps="{
        height: listHeight + 50,
      }"
      :data="listData"
      :grid-props="{ span: 3 }"
      :bordered="false"
    >
      <template #item="{ item, index }">
        <a-list-item :key="index">
          <QimImageItem :item="item"></QimImageItem>
        </a-list-item>
      </template>
    </a-list>
  </a-spin>
</template>

<style scoped lang="scss">
.spin {
  width: 100%;
  min-height: 300px;
}
</style>
