<template>
      <!-- 输入秘钥 -->
      <Modal v-model="ifShow" title="输入新 Bucket" :loading="true" @on-cancel="cancel">
          <Input v-model="newbucket" placeholder="Bucket" style="width: 100%"></Input>

          <div slot="footer">
              <Button type="info" size="large" long :loading="modal_loading">确定</Button>
          </div>
      </Modal>

</template>
<script>
export default {
    props: ['isShow'],
    data() {
        return {
            newbucket:'',
            modal_loading:false,
            ifShow: this.isShow
        }
    },
    methods: {
        cancel() {
            this.$emit('closeModal','addbucketModal')
        }
    },
    watch: {
        isShow(val){
            this.ifShow = val
        }
    }
}
</script>
<style lang="less" scoped>
.ivu {
    &-menu {
        &-horizontal {
            height: 30px;
            line-height: 30px;
        }
    }
    &-select {
        float: left;
        margin-right: 20px;
    }
    &-breadcrumb {
        line-height: 32px;
    }
    &-input-type {
        margin-bottom: 20px;
    }
}
</style>
