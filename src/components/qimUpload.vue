<template>
<Upload multiple type="drag"
:on-progress="handleProgress"
:on-success="handleSuccess"
:on-error="handleError"
:format="['jpg','jpeg','png']"
:on-format-error="handleFormatError"
:before-upload="beforeUpload"
:data='form'
action="http://upload.qiniu.com/">
    <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
        <p>上传文件到此目录(支持拖拽上传)</p>
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

export default {
    data() {
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
    methods: {
        handleFormatError(file){
            this.$Notice.warning({
                title: '请上传图片',
                desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
            });
        },
        beforeUpload(file) {
            this.form.key = this.openPrefixs.join('/') + '/' + file.name
            this.form.prefix = this.openPrefixs.join('/') + '/'
        },
        handleProgress(event, file, fileList) {
            // this.loaded = (event.loaded / 1000000).toFixed(2)
            // this.fileSize = (event.total / 1000000).toFixed(2)
            // this.percent = (event.loaded / event.total * 100).toFixed(2)
            // console.log((event.loaded / event.total * 100).toFixed(2))
        },
        handleSuccess(response, file, fileList) {
            response.mimeType = 'image'
            response.key = response.key.split('/').pop()
            this.$emit('uploadfinish',response)
            fileList.splice(fileList.indexOf(file), 1);
            this.$Message.success('上传成功')
        },
        handleError(error, response, file) {
            this.$Message.error('上传失败')
            this.$Notice.error({
                title: 'error',
                desc: response.error+': ' +file.name,
                duration: 0
            })
        }
    },
    async mounted() {
        // 获取token
        const {code,uploadToken} = await ajax.get(`/api/uploadToken?bucket=${this.currentBucket.bucket}`)
        if(code == 1){
            this.form.token = uploadToken
        }
    }
}
</script>
<style lang="less" scoped>
</style>
