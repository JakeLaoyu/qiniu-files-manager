<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark({
  selector: "body",
  attribute: "arco-theme",
  valueDark: "dark",
  valueLight: "light",
});
const toggleDark = useToggle(isDark);
</script>

<template>
  <span class="theme">
    <icon-sun-fill v-if="isDark" size="24" @click="toggleDark()" />

    <icon-moon-fill v-else size="24" @click="toggleDark()" />
  </span>
</template>

<style scoped lang="scss">
.theme {
  cursor: pointer;
}
</style>
