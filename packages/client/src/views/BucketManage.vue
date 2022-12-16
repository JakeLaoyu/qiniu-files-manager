<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import { useBucketStore, type Bucket } from "@/stores/bucket";
import { storeToRefs } from "pinia";
import { REGION } from "@/utils/constant";
import { Message, Modal } from "@arco-design/web-vue";

const bucketStore = useBucketStore();
const { buckets } = storeToRefs(bucketStore);

const selectBucketId = ref(buckets.value?.[0]?.id || "");

const onMenuItemClick = (key: string) => {
  selectBucketId.value = key;
};

const bucketInfo = computed(() => {
  return buckets.value?.find((bucket) => bucket.id === selectBucketId.value);
});

const form = ref<Bucket>(
  bucketInfo?.value || {
    id: "",
    SecretKey: "",
    AccessKey: "",
    bucket: "",
    domains: [],
    domain: "",
    isPrivate: 0,
    region: "",
  }
);

watch(
  () => selectBucketId.value,
  (id) => {
    const bucket = buckets.value?.find((bucket) => bucket.id === id);
    if (bucket) {
      form.value = {
        ...bucket,
      };
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => form.value,
  (info, oldInfo) => {
    if (info.id !== oldInfo.id) return;

    const bucketIndex = buckets.value?.findIndex(
      (bucket) => bucket.id === selectBucketId.value
    );

    buckets.value[bucketIndex] = {
      ...info,
    };

    Message.success("更新成功");
  },
  {
    deep: true,
  }
);

const onDelete = () => {
  Modal.confirm({
    title: "是否删除",
    content: `是否删除: ${bucketInfo?.value?.bucket}`,
    alignCenter: false,
    okButtonProps: {
      status: "danger",
    },
    onBeforeOk: async () => {
      buckets.value = buckets.value?.filter(
        (bucket) => bucket.id !== selectBucketId.value
      );

      return true;
    },
  });
};
</script>

<template>
  <div class="bucket-manage">
    <a-menu
      mode="horizontal"
      :default-selected-keys="[selectBucketId]"
      @menu-item-click="onMenuItemClick"
    >
      <a-menu-item v-for="bucket in buckets" :key="bucket.id">
        {{ bucket.bucket }}
      </a-menu-item>
    </a-menu>

    <a-form :model="form" :style="{ width: '600px' }">
      <a-form-item field="AccessKey" label="AccessKey">
        <a-input v-model="form.AccessKey" disabled />
      </a-form-item>
      <a-form-item field="SecretKey" label="SecretKey">
        <a-input v-model="form.SecretKey" disabled />
      </a-form-item>
      <a-form-item field="bucket" label="bucket">
        <a-input v-model="form.bucket" disabled />
      </a-form-item>
      <a-form-item field="domain" label="domain">
        <a-select v-model="form.domain">
          <a-option v-for="item in form.domains" :key="item" :value="item">
            {{ item }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="isPrivate" label="isPrivate">
        <a-select v-model="form.isPrivate">
          <a-option :value="0"> 否 </a-option>
          <a-option :value="1"> 是 </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="region" label="region">
        <a-select v-model="form.region">
          <a-option v-for="(item, key) in REGION" :key="key" :value="key">
            {{ item }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" status="danger" long @click="onDelete"
          >删除</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped lang="scss">
.bucket-manage {
  :deep(.arco-menu) {
    text-align: center;
  }

  :deep(.arco-form) {
    margin: 20px auto;
  }
}
</style>
