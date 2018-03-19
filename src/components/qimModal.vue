<template>
    <div>
        <Modal
            v-model="showModal"
            :mask-closable="false"
            :title="title"
            :closable="false"
        >
            <template v-if="type==='addBucket'">
                <Input v-model="bucket.AccessKey" placeholder="AccessKey" style="width: 100%"></Input>
                <Input v-model="bucket.SecretKey" placeholder="SecretKey" style="width: 100%"></Input>
                <Input v-model="bucket.bucket" placeholder="Bucket" style="width: 100%"></Input>
                <Input v-model="bucket.domain" placeholder="Domain(http://blogimg.jakeyu.top/)" style="width: 100%"></Input>
            </template>

            <template v-if="type==='move'">
                <Input v-model="moveTo" :placeholder="image.key" style="width: 100%"></Input>
            </template>

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
        type: String,
        title: String,
        isShow: Boolean,
        loading: Boolean,
        image: Object
    },
    data() {
        return {
            bucket: {
                AccessKey: 'uemsvJY-J6fk6tKl_gQqI2xukueSuqS4lg2LQ6tt',
                SecretKey: 'bxiLG_xOWdhn915bDrJ90bbT_o4MF79xPPtnqLRf',
                bucket: 'test',
                domain: 'http://qiniutest.jakeyu.top/'
            },
            moveTo:''
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
            if(this.type==='addBucket'){
                if(!this.valid){
                    return this.$Message.error(`请填写完整`)
                }

                var check = this.buckets.find(item => {
                    // return item.AccessKey == this.bucket.AccessKey
                    // && item.SecretKey == this.bucket.SecretKey
                    return item.bucket === this.bucket.bucket
                })

                if(check !== undefined){
                    return this.$Message.error(`Bucket 存在`)
                }

                this.$emit('ok',this.bucket)
            }else if(this.type==='move'){
                if(!this.moveTo){
                    this.$Message.error('请填写新的名称')
                    return
                }
                this.$emit('ok',this.moveTo)
            }
        }
    }
}
</script>
<style lang="less" scoped>
.ivu-input-wrapper{
    margin-bottom: 20px;
}
</style>
