<script setup lang="ts">
import { reactive } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { Notification } from "@arco-design/web-vue";
import type { FileItem } from "@arco-design/web-vue";
import mime from "mime-types";

const imagesStore = useImagesStore();

const { prefixsOpened } = storeToRefs(imagesStore);

const form = reactive({
  token: "",
  key: "",
});

const placeholder = computed(() => {
  if (prefixsOpened.value.length === 0) {
    return "当前文件夹";
  } else {
    return prefixsOpened.value.join("/") + "/";
  }
});

const beforeUpload = async (file: File) => {
  var prefix = prefixsOpened.value.length
    ? `${prefixsOpened.value.join("/")}/`
    : "";
  form.key = `${prefix}${file.name}`;

  form.token = (await imagesStore.getUploadToken()) || "";

  return Promise.resolve(true);
};

const handleError = (file: FileItem) => {
  Notification.error({
    title: "errorInfo",
    content: `${file.response?.error || "上传失败"}: ${file.name}`,
    duration: 0,
  });
};

const handleSuccess = (file: FileItem) => {
  console.log("file", file);
  const { response } = file;
  response.mimeType = mime.lookup(file.name || "");
  response.key = response.key.split("/").pop();
};
</script>

<template>
  <a-upload
    class="upload"
    :data="form"
    draggable
    action="//upload.qiniup.com/"
    :on-before-upload="beforeUpload"
    @error="handleError"
    @success="handleSuccess"
  >
    <template #upload-button>
      <div class="upload__btn">
        <div>
          <icon-plus size="30" />
          <p>
            上传文件到
            <span style="color: #f90">{{ placeholder }}</span>
            (支持拖拽上传)
          </p>
        </div>
      </div>
    </template>
  </a-upload>
</template>

<style scoped lang="scss">
.upload {
  &__btn {
    background-color: var(--color-fill-2);
    color: var(--color-text-1);
    border: 1px dashed var(--color-fill-4);
    border-radius: 2;
    height: 120px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
