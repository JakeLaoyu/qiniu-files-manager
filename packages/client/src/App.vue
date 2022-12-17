<script setup lang="ts">
import { watch, ref } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";

const router = useRouter();
const menuDefaultSelectedKeys = ref<string[]>([]);

watch(
  () => router.currentRoute.value.name,
  (name) => {
    menuDefaultSelectedKeys.value[0] = (name as string) || "home";
  },
  {
    immediate: true,
  }
);

const onMenuItemClick = (key: string) => {
  router.push({
    name: key,
  });
};
</script>

<template>
  <header class="header">
    <a-row class="header__row">
      <a-col class="header__left" :span="12">
        <RouterLink class="header__link" to="/">
          <img
            alt="Qim logo"
            class="header__logo"
            src="@/assets/logo.png"
            width="60"
            height="60"
          />

          <span>QIM</span>
        </RouterLink>
      </a-col>

      <a-col class="header__right" :span="12">
        <a-menu
          class="header__menu"
          mode="horizontal"
          :default-selected-keys="menuDefaultSelectedKeys"
          @menu-item-click="onMenuItemClick"
        >
          <a-menu-item key="home">文件管理</a-menu-item>
          <a-menu-item key="bucket">空间管理</a-menu-item>
          <a-menu-item key="search">搜索</a-menu-item>
        </a-menu>

        <QimTheme class="header__theme"></QimTheme>

        <a-button
          href="https://github.com/JakeLaoyu/qiniu-files-manager"
          target="_blank"
        >
          <template #icon>
            <icon-github />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </header>

  <div class="container">
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>

  <QimAkSkModal />
</template>

<style scoped lang="scss">
.header {
  background-color: var(--color-menu-light-bg);

  &__row {
    padding: 0 30px;
    border-bottom: 1px solid var(--color-border-3);
    height: 60px;
    box-sizing: border-box;
    margin-bottom: 20px;
  }

  &__left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 24px;
  }

  &__right {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__link {
    display: flex;
    align-items: center;
  }

  &__logo {
    margin-right: 10px;
  }

  &__menu {
    text-align: right;
  }

  &__theme {
    margin-right: 20px;
  }
}

.container {
  width: 1500px;
  margin: 0 auto;
}
</style>
