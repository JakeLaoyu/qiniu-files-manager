<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useBucketStore } from "@/stores/bucket";
import type { Bucket } from "@/stores/bucket";
import { storeToRefs } from "pinia";
import type { Form } from "@arco-design/web-vue";

const visible = ref(false);
const formRef = ref<InstanceType<typeof Form>>();
const form = reactive({
  accessKey: "",
  secretKey: "",
});
const bucketsList = ref<Bucket[]>([]);
const bucketStore = useBucketStore();

const { buckets, showAddBucketModal } = storeToRefs(bucketStore);

watch(
  () => showAddBucketModal.value,
  (val) => {
    visible.value = val;
  },
  { immediate: true }
);

onMounted(() => {
  if (buckets.value.length === 0) {
    showAddBucketModal.value = true;
  }
});

const handleCancel = () => {
  showAddBucketModal.value = false;
};

const handleBeforeOk = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    formRef.value &&
      formRef.value.validate(async (error) => {
        if (!error) {
          await bucketStore
            .postSecret({
              ...form,
            })
            .catch(() => {
              resolve(false);
            });

          const result = await bucketStore.getBuckets().catch(() => {
            resolve(false);
          });

          bucketsList.value = result?.data || [];

          resolve(true);
        } else {
          resolve(false);
        }
      });
  });
};
</script>

<template>
  <a-modal
    v-model:visible="visible"
    :align-center="false"
    :on-before-ok="handleBeforeOk"
    @cancel="handleCancel"
  >
    <template #title> 添加Bucket </template>
    <div>
      <a-form :model="form" ref="formRef">
        <a-form-item
          field="accessKey"
          label="AccessKey"
          validate-trigger="input"
          required
        >
          <a-input
            v-model="form.accessKey"
            placeholder="please enter your accessKey..."
          />
        </a-form-item>
        <a-form-item
          field="secretKey"
          label="SecretKey"
          validate-trigger="input"
          required
        >
          <a-input
            v-model="form.secretKey"
            placeholder="please enter your secretKey..."
          />
        </a-form-item>

        <div class="tip">
          <a-link href="https://portal.qiniu.com/user/key" target="__blank">
            去七牛查看
          </a-link>
        </div>
      </a-form>
    </div>
  </a-modal>

  <QimBucketsModal :buckets="bucketsList" />
</template>

<style scoped lang="scss">
.tip {
  display: flex;
  justify-content: flex-end;
}
</style>
