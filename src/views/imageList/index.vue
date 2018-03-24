<template>
<div class="layout">
    <Top
        @getList="getImagesList"
        @switchChange="switchChange"
    ></Top>

    <div class="layout-content">
        <div class="layout-content-main">
            <Row :gutter="20">
                <Col span="16" push="8" class-name="contentmain">
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
                        :choosed="multipleSwitchFile.includes(`${urlPrefix}${item.key}`)"
                        :domain="currentBucket.domain"
                        @clickImage="clickImage"
                    />
                </Col>


                <Col span="8" pull="16" class-name="left-part">
                    <QimUpload
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

import {
    debounce
} from '@util'

export default {
    components: {
        Top
    },
    data() {
        return {
            clickImageHash:'',
            MultipleSwitch: false
        }
    },
    computed: {
        ...mapState([
            'buckets',
            'currentBucket',
            'imageList',
            'imageDetail',
            'prefixs',
            'openPrefixs',
            'multipleSwitchFile'
        ]),
        ...mapGetters([
            'getDetail'
        ]),
        imageDetail(){
            return this.getDetail(this.clickImageHash)
        },
        urlPrefix(){
            return this.openPrefixs.length ? `${this.openPrefixs.join('/')}/` : ``
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
            'changeMultipleSwitchFile',
            'emptyMultipleSwitchFile'
        ]),
        switchChange(val){
            this.MultipleSwitch = val
            if(!this.MultipleSwitch){
                this.emptyMultipleSwitchFile()
            }
        },
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
            if(this.MultipleSwitch){
                this.changeMultipleSwitchFile(`${this.urlPrefix}${image.key}`)
            }
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

        handleScroll() {
            var documentHeight = document.documentElement.clientHeight
            var contentMain = document.querySelector('.contentmain')
            var detailDom = document.querySelector('.detail')
            if (detailDom && contentMain) {
                var contentMainDomClientRect = contentMain.getBoundingClientRect()
                var detailDomRect = detailDom.getBoundingClientRect()
                if (window.scrollY >= 218) {
                    var csstext = `top:${window.scrollY-206}px;left:0;width:${detailDomRect.width}px`
                    detailDom.style = detailDomRect.height >= documentHeight ? csstext + 'height:' + documentHeight + 'px;overflow:scroll;' : csstext
                } else {
                    detailDom.style = ''
                }
            }
        }
    },
    mounted() {
        window.addEventListener('scroll', debounce(this.handleScroll, 100))
        window.addEventListener('resize', debounce(this.handleScroll, 100))
        this.emptyMultipleSwitchFile()
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
