<template>
<div class="detail" v-if="detailImage" ref="detail">
    <div class="demo-spin-container" v-if="!detailImage.key">
        <Spin size="large" fix></Spin>
    </div>

    <div v-else>
        <div class="detail__img">
            <img :src="imageUrl">
        </div>
        <div class="detail__name">{{ detailImage.key.split('/')[detailImage.key.split('/').length - 1] }}</div>
        <div class="detail__url"><span>url:</span> {{ imageUrl }}</div>
        <template v-for="detailKey in Object.keys(detailImage)">
            <div :class="`detail__${detailKey}`"><span>{{detailKey}}:</span> {{ detailImage[detailKey] }}</div>
        </template>

        <div class="detail__operating">
            <ButtonGroup>
                <Button type="ghost" :loading="delLoading" @click="delImage">
                    <span v-if="!delLoading">删除</span>
                    <span v-else>Loading...</span>
                </Button>
                <Button type="ghost" @click="moveImage">移动或者重命名</Button>
            </ButtonGroup>

            <div style="margin-top:20px;">
                <a :href="imageUrl" download><Button type="ghost" icon="ios-cloud-download-outline"></Button></a>
                <a :href="imageUrl" target="_blank"><Button type="ghost" icon="eye">打开</Button></a>
                <Button type="primary" id="copyBtn" icon="ios-copy" @click="copyLink">复制链接</Button>
            </div>
        </div>
    </div>
</div>
</template>
<script>
import {
    mapState,
    mapMutations
} from 'vuex'

import {
    ajax
} from '@util'

import Clipboard from 'clipboard'

export default {
    props: {
        detailImage: {
            type: Object
        }
    },
    data() {
        return {
            delLoading: false
        }
    },
    computed: {
        ...mapState([
            'currentBucket'
        ]),
        imageUrl(){
            return this.currentBucket.domain + this.detailImage.key
        }
    },
    methods: {
        ...mapMutations([
            'deleteImage'
        ]),
        delImage(){
            this.delLoading = true
            var filename = this.detailImage.key

            this.$Modal.confirm({
                title: '确认删除',
                content: '是否删除: ' + '<span style="color:red;">' + filename + '</span>',
                loading: true,
                onOk: async () => {
                    let data = {
                        key: this.detailImage.key,
                        bucket: this.currentBucket.bucket
                    }
                    const {code} = await ajax.post('/api/delImage', data)
                    this.delLoading = false
                    this.deleteImage(this.detailImage.key)
                    this.$Message.success('删除成功')
                    this.$Modal.remove()
                    this.$emit('deleteImage')
                },
                onCancel: () => {
                    this.delLoading = false
                }
            })
        },
        moveImage(){},
        copyLink() {
            let clipboard = new Clipboard('#copyBtn', {
                text: () => this.imageUrl
            })
            clipboard.on('success', e => {
                clipboard.destroy();
                this.$Message.success('复制成功 ' + this.imageUrl);
            })
        }
    }
}
</script>
<style lang="less" scoped>
.detail {
    background: #fff;
    font-size: 14px;
    color: #666;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
    & > div {
        word-break: break-all;
        margin-bottom: 10px;
        span {
            color: #333;
        }
    }
    &__img {
        img {
            width: 100%;
        }
    }
    &__name {
        font-size: 18px;
        color: red;
    }
    &__operating {
        text-align: center;
    }
}
</style>
