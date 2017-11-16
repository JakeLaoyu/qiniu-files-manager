<template>
<!-- 输入秘钥 -->
<Modal v-model="ifShow" title="输入新 Bucket" :loading="true" @on-cancel="cancel">
    <Input v-model="newbucket" placeholder="Bucket" style="width: 100%"></Input>
    <Input v-model="domain" placeholder="Domain(http://blogimg.jakeyu.top/)" style="width: 100%"></Input>

    <div slot="footer">
        <Button type="info" size="large" long :loading="modal_loading" @click="ok">确定</Button>
    </div>
</Modal>
</template>
<script>
export default {
    props: ['isShow'],
    data() {
        return {
            newbucket: '',
            modal_loading: false,
            ifShow: this.isShow,
            domain: ''
        }
    },
    methods: {
        cancel() {
            this.$emit('closeModal')
        },
        ok() {
            if(!this.newbucket && !this.domain){
                return this.$Message.error('请填写完整');
            }

            if(JSON.parse(localStorage.bucketList).indexOf(this.newbucket)>=0){
                return this.$Message.error('Bucket 存在');
            }

            if(this.domain.substr(0,4)!='http'){
                return this.$Message.error('Domain 格式不正确');
            }


            this.domain = this.domain[this.domain.length - 1] == '/' ? this.domain : this.domain = this.domain + '/'
            this.$emit('addbucket', this.newbucket, this.domain)
        }
    },
    watch: {
        isShow(val) {
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
