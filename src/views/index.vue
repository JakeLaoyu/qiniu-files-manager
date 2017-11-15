<template>
<div class="layout">
    <Menu mode="horizontal" theme="light" active-name="1">
        <div class="layout-logo">七牛图床管理</div>
    </Menu>
    <div class="layout-breadcrumb">
        <Select v-model="bucketName" style="width:150px" @on-change="changeBucket">
            <Option :value="bucketName" >{{ bucketName }}</Option>
        </Select>
        <Breadcrumb>
            <BreadcrumbItem>{{ bucketName }}</BreadcrumbItem>
            <BreadcrumbItem v-for="item in prefixs" :key="item">{{item}}</BreadcrumbItem>
        </Breadcrumb>
    </div>
    <div class="layout-content">
        <div class="layout-content-main">
            <Row :gutter="20">
                <Col span="16" push="8">
                <Row :gutter="20">
                    <Col span="4" class-name="item-image" v-if="prefixsStr">
                    <div class="folder" @click="returnDirectory">
                        <img src="../assets/return.png" alt="">
                        <div class="folder-name">返回上一级</div>
                    </div>
                    </Col>

                    <Col span="4" class-name="item-image disable" v-else>
                    <div class="folder">
                        <img src="../assets/dms_floder.png" alt="">
                        <div class="folder-name">{{ bucketName }}</div>
                    </div>
                    </Col>

                    <Col span="4" class-name="item-image" v-for="item in prefixsList" :key="item">
                    <div class="folder" @click="clickPrefix(item)">
                        <img src="../assets/folder.png" alt="">
                        <div class="folder-name">{{ item }}</div>
                    </div>
                    </Col>

                    <Col span="4" class-name="item-image" v-for="item in imageList" :key="item.key">
                    <div class="image-wrap" @click="clickImage(item)">
                        <img :src=" domain + item.key" alt="">
                    </div>
                    </Col>
                </Row>
                </Col>


                <Col span="8" pull="16" class-name="left-part">
                <upload :prefix="prefixsStr" @uploadfinish="uploadfinish"></upload>

                <transition name="fade">
                    <div class="detail" v-if="showDetail">
                        <div class="demo-spin-container" v-if="!detailImage.key">
                            <Spin size="large" fix></Spin>
                        </div>

                        <div v-else>
                            <div class="detail__img">
                                <img :src="detailImage.url" alt="">
                            </div>
                            <div class="detail__name">{{ detailImage.name }}</div>
                            <div class="detail__url"><span>url:</span> {{ detailImage.url }}</div>
                            <div class="detail__hash"><span>hash:</span> {{ detailImage.hash }}</div>
                            <div class="detail__fsize"><span>fsize:</span> {{ detailImage.fsize }}</div>
                            <div class="detail__mimeType"><span>mimeType:</span> {{ detailImage.mimeType }}</div>
                            <div class="detail__putTime"><span>putTime:</span> {{ detailImage.putTime }}</div>
                            <div class="detail__type"><span>type:</span> {{ detailImage.type }}</div>

                            <div class="detail__operating">
                                <ButtonGroup>
                                    <Button type="ghost" :loading="delLoading" @click="delImage">
                                        <span v-if="!delLoading">删除</span>
                                        <span v-else>Loading...</span>
                                    </Button>
                                    <Button type="ghost" @click="moveImage">移动或者重命名</Button>
                                    <!-- <Button type="ghost" :loading="replaceLoading">
                                    <span v-if="!replaceLoading">替换</span>
                                    <span v-else>Loading...</span>
                                </Button> -->
                                </ButtonGroup>

                                <div style="margin-top:20px;">
                                    <a :href="detailImage.url" download><Button type="ghost" icon="ios-cloud-download-outline"></Button></a>
                                    <a :href="detailImage.url" target="_blank"><Button type="ghost" icon="eye">打开</Button></a>
                                    <Button type="primary" id="copyBtn" icon="ios-copy" @click="copyLink">复制链接</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>
                </Col>
            </Row>
        </div>
    </div>
    <!-- <div class="layout-copy">
        2017 &copy; Jake
    </div> -->

    <inputAkSk :inputAkSk="inputAkSk" @on-close="inputAkSkFinish"></inputAkSk>

    <!-- 移动 -->
    <Modal v-model="moveModal" title="移动或者重命名文件" :loading="true">
        <Input v-model="moveTo" placeholder="AccessKey" style="width: 100%"></Input>

        <div slot="footer">
            <Button type="info" size="large" long :loading="moveLoading" @click="saveMoveTo">确定</Button>
        </div>
    </Modal>
</div>
</template>
<script>
import util from '../libs/util'
import inputAkSk from '../components/inputAkSk.vue'
import upload from '../components/upload.vue'
import Clipboard from 'clipboard'
export default {
    components: {
        inputAkSk,
        upload
    },
    data() {
        return {
            moveTo: '',
            moveModal: false,
            showDetail: false,
            inputAkSk: false,
            delLoading: false,
            moveLoading: false,
            replaceLoading: false,
            bucketName: localStorage.bucket || '',
            imageList: [],
            prefixsList: [],
            prefixs: [],
            prefixsStr: '',
            domain: localStorage.domain || '',
            detailImage: {}
        }
    },
    methods: {
        uploadfinish(file) {
            this.imageList.unshift(file)
        },
        copyLink() {
            let clipboard = new Clipboard('#copyBtn', {
                text: () => this.detailImage.url
            })
            clipboard.on('success', e => {
                clipboard.destroy();
                this.$Message.success('复制成功 ' + this.detailImage.url);
            })
        },
        saveMoveTo() {
            this.moveLoading = true
            if (this.moveTo == this.detailImage.key) {
                this.moveLoading = false
                this.moveModal = false
                return
            }

            util.axios
                .post('/api/moveImage', {
                    bucket: this.bucketName,
                    key: this.detailImage.key,
                    newKey: this.moveTo
                })
                .then(res => {
                    this.moveLoading = false
                    console.log(res)
                    if (res.data.code == 1) {
                        this.moveModal = false
                        console.log(this.moveTo)
                        var moveToArr = this.moveTo.split('/')
                        if (moveToArr.length > 1) {
                            moveToArr.pop()
                            this.moveTo = moveToArr.join('/')
                            if (this.moveTo != this.prefixStr) {
                                var indexOfStevie = this.imageList.findIndex(i => i.key === this.detailImage.key)
                                this.imageList.splice(indexOfStevie, 1)
                            }
                        } else {
                            var indexOfStevie = this.imageList.findIndex(i => i.key === this.detailImage.key)
                            this.imageList[indexOfStevie].key = this.moveTo
                            this.detailImage.name = this.moveTo.split('/')[this.moveTo.split('/').length - 1]
                            this.detailImage.url = this.domain + this.moveTo
                            this.detailImage.key = this.moveTo
                        }

                    } else {
                        this.$Message.error(res.data.message);
                    }
                })
        },
        // 移动或者重命名单个文件
        moveImage() {
            this.moveModal = true
            this.moveTo = this.detailImage.key
        },
        // 删除单个文件
        delImage() {
            this.delLoading = true
            util.axios
                .post('/api/delImage', {
                    key: this.detailImage.key,
                    bucket: this.bucketName
                })
                .then(res => {
                    console.log(res)
                    if (res.data.code == 1) {
                        this.delLoading = false
                        var indexOfStevie = this.imageList.findIndex(i => i.key === this.detailImage.key);
                        this.imageList.splice(indexOfStevie, 1)
                        this.showDetail = false
                        this.detailImage = {}
                        this.$Message.success('删除成功');
                    }
                })
        },
        clickImage(image) {
            this.showDetail = true
            this.detailImage = {}
            this.getDetail(image.key)
        },
        returnDirectory() {
            this.imageList = []
            this.prefixsList=[]
            var currentDir = this.prefixs.pop() + '/'
            this.prefixsStr = this.prefixsStr.replace(currentDir, '')
            this.getList(this.prefixsStr)
        },
        // 获取文件详情
        getDetail(key) {
            util.axios
                .get('/api/detail?key=' + key + '&bucket=' + this.bucketName)
                .then(res => {
                    var data = res.data
                    if (data.code == 1) {
                        this.detailImage = data.info
                        this.detailImage.name = key.split('/')[key.split('/').length - 1]
                        this.detailImage.url = this.domain + key
                        this.detailImage.key = key
                        this.showDetail = true
                    } else {
                        this.$Message.error(data.message);
                    }
                })
        },
        // 点击文件夹
        clickPrefix(prefix) {
            this.prefixsList = []
            this.imageList = []
            this.prefixs.push(prefix)
            this.prefixsStr += prefix + '/'
            this.getList(this.prefixsStr)
        },
        // 保存 modal内容
        inputAkSkFinish() {
            window.location.reload()
            // this.bucketName = localStorage.bucket
            // this.domain = localStorage.domain
            // this.postSecret()
            // this.inputAkSk = false
        },
        // 修改容器
        changeBucket() {
            localStorage.bucket = this.bucketName
            this.getList()
        },
        // 提交秘钥
        postSecret() {
            util.axios
                .post('/api/postSecret', {
                    accessKey: localStorage.accessKey,
                    secretKey: localStorage.secretKey
                })
                .then(res => {
                    if (res.data.code == 1) {
                        this.getList()
                    }
                })
        },
        // 获取列表
        getList(prefix) {
            this.$Loading.start();
            prefix = prefix || ''
            util.axios
                .get("/api/getImages?bucket=" + localStorage.bucket + "&prefix=" + prefix + "&domain=" + window.domain)
                .then(res => {
                    var data = res.data
                    if (data.code == 1) {
                        this.modal_loading = false;

                        if (this.prefixs.length > 0) {
                            data.images.forEach(item => {
                                item.key = this.prefixsStr + item.key
                            })
                        }

                        this.imageList = data.images
                        this.prefixsList = data.prefixs
                        console.log(this.imageList)
                    } else if (data.code == 3) {
                        if (localStorage.accessKey && localStorage.secretKey) {
                            this.postSecret()
                        } else {
                            this.inputAkSk = true
                        }
                    } else if (data.code) {
                        this.$Message.error(data.message);
                        this.inputAkSk = true
                    }

                    this.$Loading.finish();
                })
        }
    },
    created() {
        //do something after creating vue instance
        this.getList()
    }
}
</script>
<style scoped lang="less">
.layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    border-bottom: 0;
}
.layout-logo {
    padding: 0 10px;
    border-radius: 3px;
    float: left;
    /*position: relative;
        top: 15px;
        left: 20px;*/
}
.layout-nav {
    width: 420px;
    margin: 0 auto;
}
.layout-assistant {
    width: 300px;
    margin: 0 auto;
    height: inherit;
}
.layout-breadcrumb {
    padding: 10px 15px 0;
    max-width: 1200px;
    margin: 0 auto;
}
.layout-content {
    min-height: calc(~"100vh - 90px");
    overflow: hidden;
    border-radius: 4px;
    max-width: 1200px;
    margin: 15px auto 0;
}
.layout-content-main {
    padding: 10px;
}
.layout-copy {
    text-align: center;
    padding: 10px 0 20px;
    color: #9ea7b4;
}

.ivu {
    &-menu {
        &-horizontal {
            height: 30px;
            line-height: 30px;
        }
    }
    &-select {
        float: left;
        margin-right: 20px;
    }
    &-breadcrumb {
        line-height: 32px;
    }
    &-input-type {
        margin-bottom: 20px;
    }
}

.item-image {
    text-align: center;
    overflow: hidden;
    cursor: pointer;
    height: 200px;
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
    &.disable{
        cursor: default;
        &:hover{
            background: #fff;
        }
        .folder{
            cursor: default;
        }
    }

    .folder {
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
}
.image-wrap {
    width: 100%;
    height: 100%;
    & > img {
        vertical-align: middle;
    }
    &:after {
        content: '';
        display: inline-block;
        vertical-align: middle;
        height: 100%;
    }
}
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
.demo-spin-container {
    width: 320px;
    height: 200px;

}
</style>
