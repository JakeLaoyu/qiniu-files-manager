<template>
    <div>
        <Modal
            v-model="showModal"
            :mask-closable="false"
            :title="title"
            :closable="false"
        >

            <Input v-model="bucket.AccessKey" placeholder="AccessKey" style="width: 100%"></Input>
            <Input v-model="bucket.SecretKey" placeholder="SecretKey" style="width: 100%"></Input>
            <Input v-model="bucket.bucket" placeholder="Bucket" style="width: 100%"></Input>
            <Input v-model="bucket.domain" placeholder="Domain(http://blogimg.jakeyu.top/)" style="width: 100%"></Input>

            <div slot="footer">
                <Button type="ghost" @click="$emit('closeModal')">取消</Button>
                <Button type="primary" :loading="loading" @click="ok">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import {
    mapState
} from 'vuex'
export default {
    props:{
        title: String,
        isShow: Boolean,
        loading: Boolean
    },
    data() {
        return {
            bucket: {
                AccessKey: 'uemsvJY-J6fk6tKl_gQqI2xukueSuqS4lg2LQ6tt',
                SecretKey: 'bxiLG_xOWdhn915bDrJ90bbT_o4MF79xPPtnqLRf',
                bucket: 'test',
                domain: 'http://qiniutest.jakeyu.top/'
            }
        }
    },
    computed: {
        ...mapState([
            'buckets'
        ]),
        showModal(){
            return this.isShow
        },
        valid(){
            return Object.keys(this.bucket).every(item => this.bucket[item])
        }
    },
    methods: {
        ok() {
            if(!this.valid){
                return this.$Message.error(`请填写完整`)
            }

            var check = this.buckets.find(item => {
                return item.AccessKey == this.bucket.AccessKey
                    && item.SecretKey == this.bucket.SecretKey
                    && item.bucket == this.bucket.bucket
            })

            if(check !== undefined){
                return this.$Message.error(`Bucket 存在`)
            }

            this.$emit('ok',this.bucket)
        }
    }
}
</script>
<style lang="less" scoped>
.ivu-input-wrapper{
    margin-bottom: 20px;
}
</style>
