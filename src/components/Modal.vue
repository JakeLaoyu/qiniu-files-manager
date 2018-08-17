<template>
<div>
  <Modal v-model="showModal" :mask-closable="false" :title="title" :closable="false">
    <template v-if="type==='addBucket'">
      <Form ref="bucket" :model="bucket" :rules="ruleValidate" :label-width="90">
        <FormItem label="AccessKey" prop="AccessKey">
          <Input v-model="bucket.AccessKey" placeholder="AccessKey" style="width: 100%"></Input>
        </FormItem>
        <FormItem label="SecretKey" prop="SecretKey">
          <Input v-model="bucket.SecretKey" placeholder="SecretKey" style="width: 100%"></Input>
        </FormItem>
        <FormItem label="空间名称" prop="bucket">
          <Input v-model="bucket.bucket" placeholder="空间名称" style="width: 100%"></Input>
        </FormItem>
        <FormItem label="域名" prop="domain">
          <Input v-model="bucket.domain" placeholder="域名(http://blogimg.jakeyu.top/)" style="width: 100%"></Input>
        </FormItem>
      </Form>
    </template>

    <template v-if="type==='move'">
      <Input v-model="moveTo" :placeholder="image.key" style="width: 100%"></Input>
    </template>

    <div slot="footer">
      <Button type="ghost" @click="$emit('closeModal')">取消</Button>
      <Button type="primary" :loading="loading" @click="handleSubmit">确定</Button>
    </div>
  </Modal>
</div>
</template>
<script>
import {
  mapState
} from 'vuex'
export default {
  props: {
    type: String,
    title: String,
    isShow: Boolean,
    loading: Boolean,
    image: Object
  },
  data () {
    return {
      bucket: {},
      ruleValidate: {
        AccessKey: [
          { required: true, message: '请填写Ak', trigger: 'blur' }
        ],
        SecretKey: [
          { required: true, message: '请填写Sk', trigger: 'blur' }
        ],
        bucket: [
          { required: true, message: '请填写空间名称', trigger: 'blur' }
        ],
        domain: [
          { required: true, message: '请填写域名', trigger: 'blur' }
        ]
      },
      moveTo: this.image ? this.image.key : ''
    }
  },
  computed: {
    ...mapState([
      'buckets'
    ]),
    showModal () {
      return this.isShow
    }
  },
  watch: {
    image (val) {
      this.moveTo = val.key
    }
  },
  methods: {
    handleSubmit () {
      if (this.type === 'move') {
        this.ok()
        return
      }
      this.$refs.bucket.validate((valid) => {
        if (valid) {
          this.$Message.success('Success!')
          this.ok()
          this.bucket = {}
        }
      })
    },
    ok () {
      if (this.type === 'addBucket') {
        var check = this.buckets.find(item => {
          return item.bucket === this.bucket.bucket
        })

        if (check !== undefined) {
          return this.$Message.error(`Bucket 存在`)
        }

        if (this.bucket.domain.charAt(this.bucket.domain.length - 1) !== '/') {
          this.bucket.domain = this.bucket.domain + '/'
        }

        this.$emit('ok', {
          ...this.bucket
        })
      } else if (this.type === 'move') {
        if (!this.moveTo) {
          this.$Message.error('请填写新的名称')
          return
        }
        this.$emit('ok', this.moveTo)
      }
    }
  }
}
</script>
<style lang="less" scoped>
</style>
