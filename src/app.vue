<template>
<div id="app" class="layout">
    <Menu mode="horizontal" theme="light" active-name="1">
        <div class="layout-logo">七牛图床管理</div>
    </Menu>

    <keep-alive>
        <router-view></router-view>
    </keep-alive>
</div>
</template>
<script>
export default {
    data() {
        return {

        }
    }
}
</script>
<style lang="less" scoped>
.layout-logo {
    padding: 0 10px;
    border-radius: 3px;
    float: left;
    /*position: relative;
        top: 15px;
        left: 20px;*/
}

.ivu {
    &-menu {
        &-horizontal {
            height: 30px;
            line-height: 30px;
        }
    }
}
</style>
