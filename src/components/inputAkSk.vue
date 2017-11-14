<template>
  <div>
      <!-- 输入秘钥 -->
      <Modal v-model="inputAkSk" title="请输入秘钥" @on-ok="saveAkSk" :closable="false" :loading="true">
          <Input v-model="AccessKey" placeholder="AccessKey" style="width: 100%"></Input>
          <Input v-model="SecretKey" placeholder="SecretKey" style="width: 100%"></Input>
          <Input v-model="bucket" placeholder="bucket" style="width: 100%"></Input>
          <Input v-model="domain" placeholder="domain(http://blogimg.jakeyu.top/)" style="width: 100%"></Input>

          <div slot="footer">
              <Button type="info" size="large" long :loading="modal_loading" @click="saveAkSk">确定</Button>
          </div>
      </Modal>
  </div>
</template>
<script>
export default {
    props: ['inputAkSk'],
    data() {
        return {
            AccessKey: '',
            SecretKey: '',
            bucket:'',
            domain:'',
            modal_loading:false
        }
    },
    methods: {
        saveAkSk() {
            if (this.AccessKey && this.SecretKey && this.bucket) {
                this.modal_loading = true;

                localStorage.accessKey = this.AccessKey
                localStorage.secretKey = this.SecretKey
                localStorage.bucket = this.bucket
                localStorage.domain = this.domain

                this.$emit('on-close')
            } else {
                this.$Modal.warning({
                    content: '请填写完整'
                })
            }
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
