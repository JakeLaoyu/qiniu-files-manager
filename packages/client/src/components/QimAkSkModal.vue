<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
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

const { buckets } = storeToRefs(bucketStore);

onMounted(() => {
  if (buckets.value.length === 0) {
    visible.value = true;
  }
});

const handleOk = () => {
  // visible.value = false;
  // formRef.value && formRef.value.validate();
};
const handleCancel = () => {
  visible.value = false;
};

const handleBeforeOk = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    formRef.value &&
      formRef.value.validate(async (error) => {
        console.log("validate", error);
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
          console.log(bucketsList.value);
          resolve(false);
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
    @ok="handleOk"
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
      </a-form>
    </div>
  </a-modal>

  <QimBucketsModal :buckets="bucketsList" />
</template>

<style scoped lang="scss"></style>