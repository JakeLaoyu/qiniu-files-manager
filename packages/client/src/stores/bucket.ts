import { computed } from "vue";
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

  const currentBucketInfo = computed(() =>
    buckets.value.find((bucket) => bucket.id === curBucketId.value)
  );

  const setBuckets = (newBuckets: Bucket[]) => {
    buckets.value = newBuckets;
  };

  const setCurBucketId = (id: string) => {
    curBucketId.value = id;
  };

  const postSecret = async ({
    accessKey,
    secretKey,
  }: {
    accessKey: string;
    secretKey: string;
  }) => {
    return ajax.post("/api/postSecret", {
      accessKey: accessKey,
      secretKey: secretKey,
    });
  };

  const getBuckets = async () => {
    return ajax.get<any, AjaxData<Bucket[]>>("/api/getBuckets").then((data) => {
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

  // function increment() {
  //   count.value && count.value++;
  // }

  return {
    buckets,
    curBucketId,
    currentBucketInfo,
    setBuckets,
    setCurBucketId,
    postSecret,
    getBuckets,
  };
});
