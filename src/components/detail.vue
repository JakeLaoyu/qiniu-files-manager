<template>
  <div class="detail" v-if="isShow">

  </div>
</template>
<script>
export default {
  props:{
    isShow: Boolean,
    default: false
  },
  data () {
      return {

      }
  }
}
</script>
<style lang="less" scoped>
.detail{
    height: 200px;
    background: #fff;
}
</style>
