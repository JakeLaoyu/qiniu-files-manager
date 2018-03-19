<template>
<Col span="4" class-name="item" v-if="type=='image'">
    <div class="item__image" @click="$emit('clickImage',item)">
        <img :src="`${domain}${openPrefixs.join('/')+'/'}${item.key}?imageView2/1/w/113/h/113`" alt="">
    </div>
</Col>
<Col span="4" class-name="item" v-else-if="type=='folder'">
    <div class="item__folder" @click="$emit('clickPrefix',item)">
        <img :src="folderImg" alt="">
        <div class="folder-name">{{ item }}</div>
    </div>
</Col>
<Col span="4" class-name="item" v-else-if="type=='return'">
    <div class="item__folder" @click="$emit('returnDirectory')">
        <img :src="returnImg" alt="">
        <div class="folder-name">返回上一级</div>
    </div>
</Col>
</template>
<script>

import folderImg from '@assets/folder.png'
import returnImg from '@assets/return.png'

import {
    mapState
} from 'vuex'

export default {
    props:{
        type: {
            type: String
        },
        item:{
            type: [Object,String]
        },
        domain:{
            type: String
        }
    },
    data() {
        return {
            folderImg,
            returnImg
        }
    },
    computed: {
        ...mapState([
            'openPrefixs'
        ])
    }
}
</script>
<style lang="less" scoped>
.item {
    text-align: center;
    overflow: hidden;
    cursor: pointer;
    height: 113px;
    margin-bottom: 20px;
    border-radius: 5px;
    background: #fff;
    &:hover {
        background: #DEDEDE;
    }
    img {
        max-width: 100%;
        max-height: 100%;
    }
    &:after {
        content: '';
        display: inline-block;
        vertical-align: middle;
        height: 100%;
    }
    &.disable {
        cursor: default;
        &:hover {
            background: #fff;
        }
        .folder {
            cursor: default;
        }
    }

    &__folder {
        width: 99%;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        img {
            width: 50%;
            margin-bottom: 10%;
        }
        &-name {
            font-size: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    &__image{
        width: 100%;
        height: 100%;
        font-size: 0;
        & > img {
            vertical-align: middle;
        }
    }
}
</style>
