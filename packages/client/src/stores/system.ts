import { ref } from "vue";
import { defineStore } from "pinia";
import { ajax } from "@/utils/ajax";
import type { AjaxData } from "@/types/ajax";
import { compare } from "semver";

type Status = {
  version: "string";
};

type GithubTag = {
  name: string;
};

export const useSystemStore = defineStore("system", () => {
  const status = ref<Status>();
  const githubTags = ref<GithubTag[]>();
  const latestVersion = ref("");

  const hasNewVersion = ref(false);

  const getStatus = async () => {
    const { data } = await ajax.get<any, AjaxData<Status>>("/api/status");
    status.value = data;
  };

  const getGithubTags = async () => {
    const data = await ajax.get<any, GithubTag[]>(
      "https://api.github.com/repos/JakeLaoyu/qiniu-files-manager/tags",
      {
        withCredentials: false,
        headers: {
          Accept: "application/vnd.github.v3.star+json",
          Authorization: "",
        },
      }
    );

    latestVersion.value = data?.[0].name.slice(1) || "0.0.0";

    githubTags.value = data;
  };

  const checkUpdate = async () => {
    if (!status.value) {
      await getStatus();
    }

    console.log("githubTags.value", githubTags.value);

    if (!githubTags.value) {
      await getGithubTags();
    }

    const { version = "" } = status.value || {};

    hasNewVersion.value = compare(version, latestVersion.value) === -1;
  };

  return {
    status,
    latestVersion,
    hasNewVersion,
    checkUpdate,
  };
});
