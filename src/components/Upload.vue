<template>
  <Upload
    multiple
    type="drag"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-format-error="handleFormatError"
    :before-upload="beforeUpload"
    :data='form'
    action="http://upload.qiniu.com/">
    <div style="padding: 20px 0">
      <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
      <p>上传文件到 <span style="color: #f90;">{{ openPrefixs.join('/') + '/' + newPrefix }}</span> (支持拖拽上传)</p>
    </div>
  </Upload>
</template>
<script>
import {
  ajax
} from '@util'

import {
  mapState
} from 'vuex'

import mime from 'mime-types'

export default {
  props: ['newPrefix'],
  data () {
    return {
      form: {
        token: ''
      }
    }
  },
  computed: {
    ...mapState([
      'currentBucket',
      'openPrefixs'
    ])
  },
  watch: {
    currentBucket () {
      this.getUploadToken()
    }
  },
  methods: {
    handleFormatError (file) {
      this.$Notice.warning({
        title: '发生错误',
        desc: '上传 ' + file.name + ' 时，发生错误，请从新上传'
      })
    },
    async beforeUpload (file) {
      var prefix = this.openPrefixs.length ? `${this.openPrefixs.join('/')}/${this.newPrefix}` : this.newPrefix
      this.form.key = `${prefix}${file.name}`
    },
    handleSuccess (response, file, fileList) {
      response.mimeType = mime.lookup(file.name)
      response.key = response.key.split('/').pop()
      fileList.splice(fileList.indexOf(file), 1)
      this.$Message.success('上传成功')
      this.$emit('uploadfinish', {
        file: response,
        newPrefix: this.newPrefix || ''
      })
    },
    handleError (errorInfo, response, file) {
      this.$Message.error('上传失败')
      this.$Notice.error({
        title: 'errorInfo',
        desc: response.error + ': ' + file.name,
        duration: 0
      })
    },
    async getUploadToken () {
      // 获取token
      const {
        code,
        uploadToken
      } = await ajax.get(`/api/uploadToken?bucket=${this.currentBucket.bucket}`)
      if (code === 1) {
        this.form.token = uploadToken
      }

      clearTimeout(this.getTokenTimeout)
      this.getTokenTimeout = setTimeout(() => {
        this.getUploadToken()
      }, 1000 * 60 * 50)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
