<script setup lang="ts">
import { computed, unref, ref, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { size } from "@/utils/format";
import { useClipboard, useDateFormat } from "@vueuse/core";
import { Message, Modal } from "@arco-design/web-vue";

const moveModalVisible = ref(false);
const imageStore = useImagesStore();

const { imageDetail, imagesList } = storeToRefs(imageStore);

const moveTo = ref(imageDetail?.value?.key || "");

watch(
  () => imageDetail.value,
  (value) => {
    moveTo.value = value?.key || "";
  }
);

const imageUrl = computed(() => {
  return imageStore.getImageUrl(imageDetail.value);
});

const onCopy = () => {
  const { copy } = useClipboard({
    source: imageUrl,
    legacy: true,
  });

  copy();
};

const infoData = computed(() => {
  if (!imageDetail.value) return [];

  const urlInfo = {
    label: "URL",
    value: imageUrl.value,
  };

  const detailInfoFormat = Object.keys(imageDetail.value || {}).map(
    (key: string) => {
      let value = imageDetail.value?.[key];

      if (key === "fsize") {
        value = size(value);
      } else if (key === "putTime") {
        value = unref(
          useDateFormat(Math.floor(value / 10000), "YYYY-MM-DD HH:mm:ss")
        );
      }

      return {
        label: key,
        value: value,
      };
    }
  );

  return [urlInfo, ...detailInfoFormat];
});

const onDelete = () => {
  Modal.confirm({
    title: "是否删除",
    content: `是否删除: ${imageDetail.value?.key}`,
    alignCenter: false,
    okButtonProps: {
      status: "danger",
    },
    onBeforeOk: async () => {
      if (!imageDetail.value) return false;

      const res = await imageStore.deleteImage(imageDetail.value);

      if (res.code === 0) {
        imagesList.value = imagesList.value.filter(
          (item) => item.key !== imageDetail.value?.key
        );
        imageDetail.value = undefined;
        return true;
      }

      return false;
    },
  });
};

const handleMove = async () => {
  if (moveTo.value === imageDetail.value?.key || !imageDetail.value) {
    moveModalVisible.value = false;
    return;
  }

  const { code } = await imageStore.moveImage(imageDetail.value, moveTo.value);

  if (code === 0) {
    Message.success("移动成功");
    location.reload();
  }
};
</script>

<template>
  <div v-if="imageDetail?.key" class="detail">
    <a-image
      class="detail__image"
      :src="imageUrl"
      width="100%"
      fit="contain"
      :preview="false"
      show-loader
    />

    <a-descriptions
      v-if="infoData.length"
      style="margin-top: 20px"
      :data="infoData"
      size="medium"
      :column="1"
    />

    <div class="detail__btns">
      <a-button-group type="primary">
        <a-button type="primary" status="danger" @click="onDelete">
          删除
        </a-button>
        <a-button @click="moveModalVisible = true">移动或重命名</a-button>
      </a-button-group>
    </div>

    <div class="detail__btns">
      <a-button-group type="primary">
        <a-button
          type="primary"
          status="success"
          :href="imageUrl"
          target="__blank"
        >
          打开
        </a-button>
        <a-button @click="onCopy">复制链接</a-button>
      </a-button-group>
    </div>
  </div>

  <a-modal
    v-model:visible="moveModalVisible"
    :align-center="false"
    @ok="handleMove"
    @cancel="moveModalVisible = false"
  >
    <template #title> 移动或重命名 </template>
    <div>
      <a-input v-model="moveTo" allow-clear />
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.detail {
  margin-top: 20px;

  &__image {
    background: var(--color-bg-white);
  }

  &__btns {
    margin-top: 10px;
    text-align: center;

    :deep(.arco-btn-group) {
      margin-bottom: 10px;
    }
  }
}
</style>
