<script setup lang="ts">
import { useBucketStore } from "@/stores/bucket";
import type { Image } from "@/types/image";
import { storeToRefs } from "pinia";

const props = defineProps<{
  item: Image;
}>();

const bucketStore = useBucketStore();

const { currentBucketInfo } = storeToRefs(bucketStore);
const { domain } = currentBucketInfo.value || {};
</script>

<template>
  <div class="item">
    <template v-if="props.item.mimeType.startsWith('image')">
      <a-image
        width="120"
        height="120"
        fit="contain"
        :preview="false"
        :src="`//${domain}/${props.item.key}?imageView2/1/w/120/h/120`"
      >
        <template #loader>
          <img
            width="120"
            :src="`//${domain}/${props.item.key}?imageView2/1/w/120/h/120`"
            style="filter: blur(5px)"
          />
        </template>
      </a-image>
    </template>

    <template v-else-if="props.item.mimeType.startsWith('folder')">
      <icon-folder size="100" />
      <div class="item__key">{{ props.item.key }}</div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.item {
  cursor: pointer;

  &__key {
    text-align: center;
  }
}
</style>
