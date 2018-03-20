<template>
<div class="layout">
    <Top
        @getList="getImagesList"
    ></Top>

    <div class="layout-content">
        <div class="layout-content-main">
            <Row :gutter="20">
                <Col span="16" push="8" ref="contentmain">
                    <QimImageItem
                        v-if="openPrefixs.length"
                        type="return"
                        @returnDirectory="returnDirectory"
                    />

                    <QimImageItem
                        v-for="(folder,index) in prefixs"
                        :key="index"
                        type="folder"
                        :item="folder"
                        @clickPrefix="clickPrefix"
                    />

                    <QimImageItem
                        v-for="item in imageList"
                        :key="item.key"
                        :item="item"
                        v-if="item.mimeType.indexOf('image')!=-1"
                        type="image"
                        :domain="currentBucket.domain"
                        @clickImage="clickImage"
                    />
                </Col>


                <Col span="8" pull="16" class-name="left-part">
                    <QimUpload
                        :prefix="prefixsStr"
                        @uploadfinish="uploadfinish"
                    ></QimUpload>

                    <transition name="fade">
                        <QimDetail
                            :detailImage="imageDetail"
                            v-if="clickImageHash"
                            @deleteImage="clickImageHash=''"
                            @imageload="handleScroll"
                        />
                    </transition>
                </Col>
            </Row>
        </div>
    </div>

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
            prefixsStr:'',
            clickImageHash:''
        }
    },
    computed: {
        ...mapState([
            'buckets',
            'currentBucket',
            'imageList',
            'imageDetail',
            'prefixs',
            'openPrefixs'
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
            'unshift',
            'pushOpenPrefixs',
            'popOpenPrefixs',
        ]),
        clickPrefix(folder){
            this.clickImageHash = ''
            this.pushOpenPrefixs(folder)
            this.getImagesList()
        },
        returnDirectory(){
            this.clickImageHash = ''
            this.popOpenPrefixs()
            this.getImagesList()
        },
        uploadfinish(file){
            this.unshift(file)
        },
        clickImage(image){
            this.clickImageHash = image.hash
            this.getImageDetail({
                bucket: this.currentBucket.bucket,
                image: image
            })
        },
        getImagesList(){
            this.getList({
                bucket: this.currentBucket.bucket,
                domain: this.currentBucket.domain,
                prefix: this.openPrefixs.length ? this.openPrefixs.join('/')+'/' : ''
            })
        },
        // 去抖函数
        debounce(fn, delay) {
            let timer = null;
            return function() {
                let context = this;
                let args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            }
        },
        handleScroll() {
            var documentHeight = document.documentElement.clientHeight
            var contentMainDomClientRect = this.$refs.contentmain.$vnode.elm.getBoundingClientRect()
            if (document.querySelector('.detail') && this.$refs.contentmain.$vnode) {
                var detailDom = document.querySelector('.detail')
                var clientRect = detailDom.getBoundingClientRect()
                if (window.scrollY >= 218) {
                    var csstext = "position:fixed;top:0;left:" + (contentMainDomClientRect.x - 10 - clientRect.width) + 'px;width:' + clientRect.width + 'px;'
                    detailDom.style = clientRect.height >= documentHeight ? csstext + 'height:' + documentHeight + 'px;overflow:scroll;' : csstext
                } else {
                    detailDom.style = ''
                }
            }
        }
    },
    mounted() {
        window.addEventListener('scroll', this.debounce(this.handleScroll, 100))
        window.addEventListener('resize', this.debounce(this.handleScroll, 100))
        this.getImagesList()
    },
    async created() {
        await this.postSecrte({
            accessKey: this.currentBucket.AccessKey,
            secretKey: this.currentBucket.SecretKey
        })
    }
}
</script>
<style lang="less" scoped>
.layout{
    width: 1200px;
    margin: 0 auto;
    border: none;
    &-content {
        min-height: calc(~"100vh - 90px");
        overflow: hidden;
        border-radius: 4px;
        width: 1200px;
        margin: 0 auto 0;
    }
    &-content-main {
        padding: 10px;
    }
}
</style>
