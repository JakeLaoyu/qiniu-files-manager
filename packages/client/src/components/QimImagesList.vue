<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { useElementBounding, useWindowSize } from "@vueuse/core";

const imageStore = useImagesStore();
const listHeight = ref(0);

const listRef = ref<HTMLElement>();

const { imagesList, prefixs } = storeToRefs(imageStore);

const prefixsFormat = computed(() =>
  prefixs.value.map((item) => {
    return {
      key: item,
      mimeType: "folder",
    };
  })
);

const listData = computed(() => {
  return [...prefixsFormat.value, ...imagesList.value];
});

const computedListMaxHeight = () => {
  const { height } = useWindowSize();
  const { top: listTop } = useElementBounding(listRef);

  listHeight.value = height.value - listTop.value;
};

onMounted(() => {
  computedListMaxHeight();
});
</script>

<template>
  <div>
    <a-list
      ref="listRef"
      :max-height="listHeight"
      :virtualListProps="{
        height: listHeight,
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
  </div>
</template>

<style scoped lang="scss"></style>
