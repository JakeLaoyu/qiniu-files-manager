<script setup lang="ts">
import { ref, watch, reactive } from "vue";
import { useBucketStore } from "@/stores/bucket";
import type { Bucket } from "@/stores/bucket";
import { REGION } from "@/utils/constant";
import { Message } from "@arco-design/web-vue";
import type { TableRowSelection } from "@arco-design/web-vue";
import { storeToRefs } from "pinia";

const props = defineProps<{
  buckets: Bucket[];
}>();

const bucketStore = useBucketStore();
const { buckets, curBucketId } = storeToRefs(bucketStore);

const visible = ref(false);
const bucketsCopy = ref(props.buckets);
const selectedKeys = ref<string[]>([]);
const rowSelection = reactive<TableRowSelection>({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
});

watch(
  () => props.buckets,
  (val) => {
    bucketsCopy.value = val;

    if (bucketsCopy.value.length) {
      selectedKeys.value = bucketsCopy.value.map((item) => item.id);
      visible.value = true;
    }
  },
  { immediate: true }
);

const columns = [
  {
    title: "空间名称",
    dataIndex: "bucket",
    width: 100,
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
  if (selectedKeys.value.length === 0) {
    Message.error("请添加至少一个 Bucket");
    return false;
  }

  const selectedBuckets = bucketsCopy.value.filter((item) =>
    selectedKeys.value.includes(item.id)
  );

  buckets.value = [...buckets.value, ...selectedBuckets];
  curBucketId.value = selectedBuckets[0].id;

  return true;
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
    width="auto"
    @cancel="handleCancel"
  >
    <template #title> 添加 Buckets </template>
    <a-table
      :columns="columns"
      :data="bucketsCopy"
      :pagination="false"
      row-key="id"
      v-model:selectedKeys="selectedKeys"
      :row-selection="rowSelection"
      style="margin-top: 20px"
    >
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
