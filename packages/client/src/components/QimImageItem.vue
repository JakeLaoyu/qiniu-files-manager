<script setup lang="ts">
import { useImagesStore } from "@/stores/images";
import type { Image, Folder } from "@/types/image";
import { storeToRefs } from "pinia";

const props = defineProps<{
  item: Image | Folder;
}>();

const imagesStore = useImagesStore();
const { prefixsOpened, multipleMode, selectedList } = storeToRefs(imagesStore);

const onClick = () => {
  if (props.item.mimeType.startsWith("folder")) {
    imagesStore.prefixsOpened = [...prefixsOpened.value, props.item.key];
  } else if (props.item.mimeType.startsWith("back")) {
    imagesStore.prefixsOpened = prefixsOpened.value.slice(0, -1);
  } else {
    imagesStore.getImageDetail(props.item as Image);

    if (multipleMode.value) {
      if (selectedList.value.includes(props.item.key)) {
        const index = selectedList.value.indexOf(props.item.key);

        if (index > -1) {
          selectedList.value.splice(index, 1);
        }
      } else {
        selectedList.value.push(props.item.key);
      }
    }
  }
};
</script>

<template>
  <div
    class="item"
    :class="{
      'item--image': props.item.mimeType.startsWith('image'),
    }"
    @click="onClick"
  >
    <template v-if="props.item.mimeType.startsWith('image')">
      <a-image
        width="120"
        height="120"
        fit="contain"
        :preview="false"
        :src="`${imagesStore.getImageUrl(props.item as Image)}?imageView2/1/w/120/h/120`"
        show-loader
      />

      <icon-check-circle-fill
        v-if="multipleMode && selectedList.includes(props.item.key)"
        class="item__selected"
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

    <template v-else>
      <icon-file size="100" />
      <div class="item__key">{{ props.item.key }}</div>

      <icon-check-circle-fill
        v-if="multipleMode && selectedList.includes(props.item.key)"
        class="item__selected"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.item {
  cursor: pointer;
  text-align: center;
  position: relative;

  &--image {
    background: var(--color-bg-white);
  }

  &__return {
    width: 100px;
  }

  &__key {
    text-align: center;
  }

  &__selected {
    position: absolute;
    right: 5px;
    top: 5px;
    color: red;
  }
}
</style>
