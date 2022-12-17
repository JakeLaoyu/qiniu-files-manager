<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import {
  useElementBounding,
  useThrottledRefHistory,
  useWindowSize,
} from "@vueuse/core";
import { useBucketStore } from "@/stores/bucket";

const bucketStore = useBucketStore();
const imagesStore = useImagesStore();
const listHeight = ref(0);

const listRef = ref<HTMLElement>();

const {
  imagesList,
  prefixs,
  listLoading,
  prefixsOpened,
  filterKeyword,
  nextMarker,
} = storeToRefs(imagesStore);

const { currentBucketInfo } = storeToRefs(bucketStore);
const { history } = useThrottledRefHistory(filterKeyword, {
  deep: true,
  throttle: 500,
});

watch(
  () => prefixsOpened.value,
  () => {
    imagesStore.getList();
  }
);

watch(
  () => currentBucketInfo.value,
  () => {
    imagesStore.resetImageStore();
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

  const filterReg = new RegExp(history.value[0].snapshot, "i");

  return [
    ...back,
    ...prefixsFormat.value.filter((item) => filterReg.test(item.key)),
    ...imagesList.value.filter((item) => filterReg.test(item.key)),
  ];
});

const onReachBottom = async () => {
  if (!imagesList.value.length || !nextMarker.value) return;

  imagesStore.getList();
};

const computedListMaxHeight = () => {
  const { height } = useWindowSize();
  const { top: listTop } = useElementBounding(listRef);

  listHeight.value = height.value - listTop.value;
};

onMounted(() => {
  nextTick(() => {
    computedListMaxHeight();
  });
});
</script>

<template>
  <a-list
    ref="listRef"
    :max-height="listHeight"
    :virtualListProps="{
      height: listHeight + 50,
      fixedSize: true,
      buffer: 20,
    }"
    :loading="listLoading"
    :data="listData"
    :grid-props="{ span: 4 }"
    :bordered="false"
    @reach-bottom="onReachBottom"
  >
    <template #item="{ item }">
      <a-list-item :key="item.key">
        <QimImageItem :item="item"></QimImageItem>
      </a-list-item>
    </template>
  </a-list>
</template>

<style scoped lang="scss">
.spin {
  width: 100%;
  min-height: 300px;
}
</style>
