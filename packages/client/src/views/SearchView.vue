<script setup lang="ts">
import { ref } from "vue";
import { useImagesStore } from "@/stores/images";
import type { Image } from "@/types/image";
import { useClipboard, useDateFormat } from "@vueuse/core";
import { Message } from "@arco-design/web-vue";
import { size } from "@/utils/format";

const loading = ref(false);
const keyword = ref("");
const images = ref<Image[]>([]);
const imagesStore = useImagesStore();

const onSearch = async () => {
  loading.value = true;
  const res = await imagesStore.getList({
    search: keyword.value,
  });

  loading.value = false;

  console.log("res", res);
  images.value = res?.images || [];
};

const onCopy = async (image: Image) => {
  const url = imagesStore.getImageUrl(image);

  const { copy } = useClipboard({
    source: url,
    read: true,
    legacy: true,
  });

  await copy();

  Message.success(`复制成功: ${url}`);
};

const onDelete = async (image: Image, index: number) => {
  const res = await imagesStore.deleteImage(image);

  if (res.code === 0) {
    Message.success(`删除成功: ${image.key}`);
    images.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="search">
    <div class="search__input">
      <a-input-search
        v-model="keyword"
        placeholder="关键字"
        allow-clear
        @press-enter="onSearch"
      />
    </div>

    <div v-if="loading || images.length" class="search__images">
      <a-spin :loading="loading">
        <div class="search__tip">共计 {{ images.length }} 条搜索结果</div>
        <a-list :gridProps="{ gutter: 0, span: 4 }" :bordered="false">
          <a-list-item v-for="(item, index) in images" :key="item.hash">
            <a-image
              width="200"
              :src="`${imagesStore.getImageUrl(item)}`"
              show-loader
            >
              <template #extra>
                <div class="search__image-actions">
                  <span class="action" @click="onCopy(item)">
                    <a-tooltip content="复制">
                      <icon-copy />
                    </a-tooltip>
                  </span>

                  <a-popover :title="item.key" trigger="click">
                    <a-tooltip content="信息">
                      <icon-info-circle />
                    </a-tooltip>

                    <template #content>
                      <p v-for="(value, key) in item" :key="key">
                        <span>{{ key }}: </span>
                        <span v-if="key === 'putTime'">
                          {{
                            useDateFormat(
                              Math.floor((value as number) / 10000),
                              "YYYY-MM-DD HH:mm:ss"
                            )
                          }}
                        </span>
                        <span v-if="key === 'fsize'">
                          {{ size(value as number) }}
                        </span>
                        <span v-else>{{ value }}</span>
                      </p>
                    </template>
                  </a-popover>

                  <a-popconfirm
                    content="确认删除？"
                    :ok-button-props="{
                      status: 'danger',
                    }"
                    @ok="onDelete(item, index)"
                  >
                    <a-tooltip content="删除">
                      <icon-delete />
                    </a-tooltip>
                  </a-popconfirm>
                </div>
              </template>
            </a-image>
          </a-list-item>
        </a-list>
      </a-spin>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search {
  &__input {
    width: 720px;
    margin: 0 auto;
  }

  &__images {
    min-height: 300px;

    :deep(.arco-spin) {
      display: block;
    }
  }

  &__tip {
    margin: 20px 0;
    text-align: center;
  }

  :deep(.arco-image-footer-extra) {
    flex: 1;
  }

  :deep(.arco-image-footer) {
    background-color: rgba(0, 0, 0, 0.4);
    padding: 0 16px;
  }

  &__image-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
