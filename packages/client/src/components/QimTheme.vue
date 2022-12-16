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
    <QimSunAndMoon @click="toggleDark()"></QimSunAndMoon>
  </span>
</template>

<style scoped lang="scss">
.theme {
  cursor: pointer;
  font-size: 0;
}
</style>
