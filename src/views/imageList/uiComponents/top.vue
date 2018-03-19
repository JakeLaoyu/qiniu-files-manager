<template>
    <div class="top">
        <Button class="add-bucket" type="primary" @click="$emit('addBucket')">添加Bucket</Button>
    </div>
</template>
<script>
export default {

}
</script>
<style lang="less" scoped>
.top{
    width: 1200px;
    margin: 0 auto;
    padding: 10px 15px 0;
}
</style>
