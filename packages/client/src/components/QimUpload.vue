<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { Notification } from "@arco-design/web-vue";
import type { FileItem } from "@arco-design/web-vue";
import mime from "mime";
import { useBucketStore } from "@/stores/bucket";

const imagesStore = useImagesStore();
const bucketStore = useBucketStore();

const { prefixsOpened, imagesList, newPrefixFormat, prefixs } =
  storeToRefs(imagesStore);
const { currentBucketInfo } = storeToRefs(bucketStore);

const uploadToken = ref("");

const getUploadToken = async () => {
  uploadToken.value = (await imagesStore.getUploadToken()) || "";

  setTimeout(() => {
    getUploadToken();
  }, 1000 * 60 * 50);
};

const placeholder = computed(() => {
  if (prefixsOpened.value.length === 0) {
    if (newPrefixFormat.value) {
      return newPrefixFormat.value;
    } else {
      return "当前文件夹";
    }
  } else {
    return prefixsOpened.value.join("/") + "/" + newPrefixFormat.value;
  }
});

const customRequest = (option: any) => {
  const { onProgress, onError, onSuccess, fileItem, name } = option;
  const xhr = new XMLHttpRequest();
  if (xhr.upload) {
    xhr.upload.onprogress = function (event) {
      let percent;
      if (event.total > 0) {
        // 0 ~ 1
        percent = event.loaded / event.total;
      }
      onProgress(percent, event);
    };
  }
  xhr.onerror = function error(e) {
    onError(e);
  };
  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      return onError(xhr.responseText);
    }

    onSuccess(xhr.response);
  };

  const formData = new FormData();
  var prefix = prefixsOpened.value.length
    ? `${prefixsOpened.value.join("/")}/${newPrefixFormat.value}`
    : newPrefixFormat.value;
  formData.append("key", `${prefix}${fileItem.name}`);
  formData.append("token", uploadToken.value);
  formData.append(name || "file", fileItem.file);
  xhr.open("post", "//upload.qiniup.com/", true);
  xhr.send(formData);

  return {
    abort() {
      xhr.abort();
    },
  };
};

const handleError = (file: FileItem) => {
  Notification.error({
    title: "errorInfo",
    content: `${file.response?.error || "上传失败"}: ${file.name}`,
    duration: 0,
  });
};

const handleSuccess = async (file: FileItem) => {
  console.log("file", file);
  try {
    file.response = JSON.parse(file.response);
  } catch (error) {
    //
  }
  const { response } = file;
  response.mimeType = mime.getType(file.name || "");
  response.key = response.key.split("/").pop();

  console.log("response", response);

  if (newPrefixFormat.value.includes("/")) {
    prefixs.value.unshift(newPrefixFormat.value.split("/")[0]);

    return;
  }

  let key = `${
    prefixsOpened.value.length ? prefixsOpened.value.join("/") + "/" : ""
  }${response.key}`;

  if (currentBucketInfo?.value?.isPrivate) {
    const token = await imagesStore.getPrivateToken(key);
    response.private = token;
  }

  imagesList.value.unshift({
    ...response,
    key,
  });
};

onMounted(() => {
  getUploadToken();
});
</script>

<template>
  <a-upload
    class="upload"
    draggable
    multiple
    :custom-request="customRequest"
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
