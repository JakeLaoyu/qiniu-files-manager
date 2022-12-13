<script setup lang="ts">
import { ref, watch } from "vue";
import type { Bucket } from "@/stores/bucket";
import { REGION } from "@/utils/constant";

const props = defineProps<{
  buckets: Bucket[];
}>();

const visible = ref(false);
const bucketsCopy = ref(props.buckets);

watch(
  () => props.buckets,
  (val) => {
    bucketsCopy.value = val;
    console.log("bucketsCopy", bucketsCopy);
    if (bucketsCopy.value.length) {
      visible.value = true;
    }
  },
  { immediate: true }
);

const columns = [
  {
    title: "空间名称",
    dataIndex: "bucket",
  },
  {
    title: "域名",
    dataIndex: "domains",
    slotName: "domains",
  },
  {
    title: "空间区域",
    dataIndex: "region",
    slotName: "region",
  },
  {
    title: "是否私有",
    dataIndex: "isPrivate",
    slotName: "isPrivate",
  },
];

const handleBeforeOk = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return true;
  // prevent close
  // return false;
};
const handleCancel = () => {
  visible.value = false;
};
</script>

<template>
  <a-modal
    v-model:visible="visible"
    :align-center="false"
    :on-before-ok="handleBeforeOk"
    unmountOnClose
    @cancel="handleCancel"
  >
    <template #title> 添加 Buckets </template>
    <a-table :columns="columns" :data="bucketsCopy" style="margin-top: 20px">
      <template #domains="{ record }">
        <a-select v-model="record.domain" :options="record.domains" />
      </template>

      <template #region="{ record }">
        <a-select v-model="record.region">
          <a-option
            v-for="value of Object.keys(REGION)"
            :key="value"
            :value="value"
          >
            {{ REGION[value] }}
          </a-option>
        </a-select>
      </template>

      <template #isPrivate="{ record }">
        <a-select v-model="record.isPrivate">
          <a-option :value="0">否</a-option>
          <a-option :value="1">是</a-option>
        </a-select>
      </template>
    </a-table>
  </a-modal>
</template>

<style scoped lang="scss"></style>
