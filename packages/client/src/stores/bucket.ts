import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { ajax } from "@/utils/ajax";
import type { AjaxData } from "@/types/ajax";
import { v4 as uuidv4 } from "uuid";

export type Bucket = {
  id: string;
  SecretKey: string;
  AccessKey: string;
  bucket: string;
  domains: string[];
  domain: string;
  isPrivate: number;
  region: string;
};

export const useBucketStore = defineStore("bucket", () => {
  const buckets = useStorage<Bucket[]>("buckets", []);
  const curBucketId = useStorage("curBucketId", "");

  const showAddBucketModal = ref(false);

  const currentBucketInfo = computed(() =>
    buckets.value.find((bucket) => bucket.id === curBucketId.value)
  );

  const postSecret = async ({ accessKey = "", secretKey = "" } = {}) => {
    const { AccessKey, SecretKey } = currentBucketInfo.value || {};

    return ajax.post("/api/secret", {
      accessKey: AccessKey || accessKey,
      secretKey: SecretKey || secretKey,
    });
  };

  const getBuckets = async () => {
    return ajax.get<any, AjaxData<Bucket[]>>("/api/buckets").then((data) => {
      if (data.data) {
        data.data = data.data.map((item: any) => {
          return {
            id: uuidv4(),
            domain: item.domains?.[0] || "",
            ...item,
          };
        });
      }
      return data;
    });
  };

  return {
    buckets,
    curBucketId,
    currentBucketInfo,
    showAddBucketModal,
    postSecret,
    getBuckets,
  };
});
