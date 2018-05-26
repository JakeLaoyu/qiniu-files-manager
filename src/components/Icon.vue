<template>
  <svg class="icon" aria-hidden="true" :style="style">
    <use :xlink:href="`#icon-${icon}`"></use>
  </svg>
</template>
<script>
export default {
  props: {
    icon: {
      require: true,
      type: String
    },
    size: {
      type: String
    }
  },
  data () {
    return {}
  },
  computed: {
    style () {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`
      }
    }
  }
}
</script>
<style lang="less" scoped>
.icon {
  width: 40px;
  height: 40px;
  fill: currentColor;
  overflow: hidden;
}
</style>
