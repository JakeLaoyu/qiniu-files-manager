<template>
<Upload multiple type="drag"
:on-progress="handleProgress"
:on-success="handleSuccess"
:on-error="handleError"
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
import util from '../libs/util'

export default {
    props: {
        prefix: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            form: {
                token: '',
                prefix: this.prefix
            }
        }
    },
    methods: {
        beforeUpload(file) {
            this.form.key = this.prefix + file.name
        },
        handleProgress(event, file, fileList) {
            // this.loaded = (event.loaded / 1000000).toFixed(2)
            // this.fileSize = (event.total / 1000000).toFixed(2)
            // this.percent = (event.loaded / event.total * 100).toFixed(2)
            // console.log((event.loaded / event.total * 100).toFixed(2))
        },
        handleSuccess(response, file, fileList) {
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
    created() {
        //do something after creating vue instance
        // 获取token
        util.axios
            .get('/api/uploadToken?bucket='+localStorage.bucket)
            .then(res => {
                if(res.data.code ==1){
                    this.form.token=res.data.uploadToken
                }
            })
    }
}
</script>
<style lang="less" scoped>
</style>
