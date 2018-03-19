<template>
<div class="layout">
    <Top @addBucket="showModal=true"></Top>

    <div class="layout-content">
        <div class="layout-content-main">
            <Row :gutter="20">
                <Col span="16" push="8" ref="contentmain">
                    <QimImageItem
                        v-for="item in imageList"
                        :key="item.key"
                        :item="item"
                        :domain="currentBucket.domain"
                        @clickImage="clickImage"
                    ></QimImageItem>
                </Col>


                <Col span="8" pull="16" class-name="left-part">
                    <QimUpload
                        :prefix="prefixsStr"
                        @uploadfinish="uploadfinish"
                    ></QimUpload>

                    <QimDetail
                        :detailImage="imageDetail"
                    >
                    </QimDetail>
                </Col>
            </Row>
        </div>
    </div>

    <qimModal
        :isShow="showModal"
        title="添加Bucket"
        @ok="addBucket"
        :loading="modalLoading"
        @closeModal="closeModal"
    >
    </qimModal>
</div>
</template>
<script>
import Top from './uiComponents/top.vue'

import {
    mapState,
    mapGetters,
    mapActions,
    mapMutations
} from 'vuex'

export default {
    components: {
        Top
    },
    data() {
        return {
            showModal: false,
            modalLoading: false,
            prefixsStr:'',
            clickImageHash:''
        }
    },
    computed: {
        ...mapState([
            'buckets',
            'currentBucket',
            'imageList',
            'imageDetail'
        ]),
        ...mapGetters([
            'getDetail'
        ]),
        imageDetail(){
            return this.getDetail(this.clickImageHash)
        }
    },
    methods: {
        ...mapActions([
            'getList',
            'postSecrte',
            'getImageDetail'
        ]),
        ...mapMutations([
            'setBucket',
            'setCurrentBucket',
            'unshift'
        ]),
        uploadfinish(file){
            this.unshift(file)
        },
        addBucket(payload){
            this.modalLoading = true
            this.setBucket(payload)
            this.setCurrentBucket(payload)
            this.modalLoading = false
            this.showModal = false
        },
        closeModal(){
            this.showModal = false
        },
        clickImage(image){
            this.clickImageHash = image.hash
            this.getImageDetail({
                bucket: this.currentBucket.bucket,
                image: image
            })
        }
    },
    mounted() {
        this.getList({
            accessKey: this.currentBucket.AccessKey,
            secretKey: this.currentBucket.SecretKey,
            bucket: this.currentBucket.bucket,
            domain: this.currentBucket.domain
        })
    },
    created() {
        this.postSecrte({
            accessKey: this.currentBucket.AccessKey,
            secretKey: this.currentBucket.SecretKey
        })
    }
}
</script>
<style lang="less" scoped>
.layout{
    &-content {
        min-height: calc(~"100vh - 90px");
        overflow: hidden;
        border-radius: 4px;
        width: 1200px;
        margin: 15px auto 0;
    }
    &-content-main {
        padding: 10px;
    }
}
</style>
