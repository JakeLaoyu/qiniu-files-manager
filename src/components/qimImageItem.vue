<template>
<Col span="4" class-name="item" v-if="type=='image'">
    <div class="image-wrap" @click="$emit('clickImage',item)">
        <img :src="`${domain}${item.key}?imageView2/1/w/113/h/113`" alt="">
    </div>
</Col>
</template>
<script>

export default {
    props:{
        type: {
            type: String
        },
        item:{
            type: Object
        },
        domain:{
            type: String
        }
    }
}
</script>
<style lang="less" scoped>
.item{
    cursor: pointer;
}
</style>
