<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useBucketStore } from "@/stores/bucket";
import { useImagesStore } from "@/stores/images";
import { Message, Modal } from "@arco-design/web-vue";

const bucketStore = useBucketStore();
const imagesStore = useImagesStore();

const { buckets, curBucketId } = storeToRefs(bucketStore);
const { newPrefix, filterKeyword, multipleMode, selectedList, imagesList } =
  storeToRefs(imagesStore);

const moveModal = ref(false);
const moveTo = ref("");

watch(
  () => multipleMode.value,
  () => {
    selectedList.value = [];
  }
);

const selectedAll = computed(() => {
  return (
    selectedList.value.length > 0 &&
    selectedList.value.length === imagesList.value.length &&
    imagesList.value.every((image) => selectedList.value.includes(image.key))
  );
});

const onSelectChange = (val: boolean | (string | number | boolean)[]) => {
  if (val) {
    selectedList.value = imagesList.value.map((image) => image.key);
  } else {
    selectedList.value = [];
  }
};

const handleMove = async () => {
  console.log("handleMove");
  if (moveTo.value.charAt(0) !== "/") {
    Message.error("请输入以 / 开头的绝对路径");
    return false;
  }

  const moveToFormat =
    moveTo.value.charAt(moveTo.value.length - 1) === "/"
      ? moveTo.value
      : `${moveTo.value}/`;

  const res = await imagesStore.multipleMoveImage(moveToFormat);
  if (res.code === 0) {
    Message.success(`移动完成`);
    selectedList.value = [];
    return true;
  }

  return false;
};

const handleDel = () => {
  Modal.confirm({
    title: "是否删除",
    content: "是否删除多个文件？",
    alignCenter: false,
    okButtonProps: {
      status: "danger",
    },
    onBeforeOk: async () => {
      const res = await imagesStore.deleteImage(selectedList.value);

      if (res.code === 0) {
        Message.success(`删除成功`);
        selectedList.value = [];
        return true;
      }
      return false;
    },
  });
};
</script>

<template>
  <div class="tool-bar">
    <div class="tool-bar__left">
      <a-select v-model="curBucketId" placeholder="Please select ...">
        <a-option v-for="value in buckets" :key="value.id" :value="value.id">
          {{ value.bucket }}
        </a-option>
      </a-select>

      <a-input v-model="newPrefix" placeholder="添加前缀" allow-clear />

      <a-input v-model="filterKeyword" placeholder="过滤" allow-clear />
    </div>

    <div class="tool-bar__right">
      <a-space>
        <div class="tool-bar__multiple" v-if="multipleMode">
          <a-space>
            <a-button-group type="primary">
              <a-button @click="moveModal = true">移动</a-button>
              <a-button status="danger" @click="handleDel"> 删除 </a-button>
            </a-button-group>

            <a-tag color="arcoblue" bordered>{{ selectedList.length }}</a-tag>

            <a-checkbox :model-value="selectedAll" @change="onSelectChange">
              全选
            </a-checkbox>
          </a-space>
        </div>

        <a-radio-group v-model="multipleMode" type="button">
          <a-radio :value="false">单选</a-radio>
          <a-radio :value="true">多选</a-radio>
        </a-radio-group>
      </a-space>
    </div>
  </div>

  <a-modal
    v-model:visible="moveModal"
    :align-center="false"
    title="移动"
    :on-before-ok="handleMove"
    @cancel="moveModal = false"
  >
    <a-input
      v-model="moveTo"
      placeholder="移动到的路径（必须是绝对路径）"
      allow-clear
    />
  </a-modal>
</template>

<style scoped lang="scss">
.tool-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  :deep(.arco-select) {
    width: 200px;
  }

  :deep(.arco-input-wrapper) {
    width: 200px;
    margin-left: 10px;
  }
}
</style>
