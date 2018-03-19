<template>
<div class="detail" v-if="detailImage" ref="detail">
    <div class="demo-spin-container" v-if="!detailImage.key">
        <Spin size="large" fix></Spin>
    </div>

    <div v-else>
        <div class="detail__img">
            <img :src="currentBucket.domain + detailImage.key">
        </div>
        <div class="detail__name">{{ detailImage.name }}</div>
        <div class="detail__url"><span>url:</span> {{ currentBucket.domain + detailImage.key }}</div>
        <div class="detail__hash"><span>hash:</span> {{ detailImage.hash }}</div>
        <div class="detail__fsize"><span>fsize:</span> {{ detailImage.fsize }}</div>
        <div class="detail__mimeType"><span>mimeType:</span> {{ detailImage.mimeType }}</div>
        <div class="detail__putTime"><span>putTime:</span> {{ detailImage.putTime }}</div>
        <div class="detail__type"><span>type:</span> {{ detailImage.type }}</div>
        </div>
    </div>
</div>
</template>
<script>
import {
    mapState
} from 'vuex'
export default {
    props: {
        detailImage:{
            type: Object
        }
    },
    computed: {
        ...mapState([
            'currentBucket'
        ])
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
