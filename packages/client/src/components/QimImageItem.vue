<script setup lang="ts">
import { useBucketStore } from "@/stores/bucket";
import { useImagesStore } from "@/stores/images";
import type { Image, Folder } from "@/types/image";
import { storeToRefs } from "pinia";

const props = defineProps<{
  item: Image | Folder;
}>();

const imagesStore = useImagesStore();
const { prefixsOpened } = storeToRefs(imagesStore);

const onClick = () => {
  console.log("QimImageItem onClick", props.item);
  if (props.item.mimeType.startsWith("folder")) {
    imagesStore.setPrefixs([...prefixsOpened.value, props.item.key]);
  } else if (props.item.mimeType.startsWith("back")) {
    imagesStore.setPrefixs(prefixsOpened.value.slice(0, -1));
  }
};

const bucketStore = useBucketStore();

const { currentBucketInfo } = storeToRefs(bucketStore);
const { domain } = currentBucketInfo.value || {};
</script>

<template>
  <div class="item" @click="onClick">
    <template v-if="props.item.mimeType.startsWith('image')">
      <a-image
        width="120"
        height="120"
        fit="contain"
        :preview="false"
        :src="`//${domain}/${props.item.key}?imageView2/1/w/120/h/120`"
        show-loader
      />
    </template>

    <template v-else-if="props.item.mimeType.startsWith('folder')">
      <icon-folder size="100" />
      <div class="item__key">{{ props.item.key }}</div>
    </template>

    <template v-else-if="props.item.mimeType.startsWith('back')">
      <img class="item__return" src="@/assets/return.png" alt="返回上一级" />
      <div class="item__key">{{ props.item.key }}</div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.item {
  cursor: pointer;

  &__return {
    width: 100px;
  }

  &__key {
    text-align: center;
  }
}
</style>
