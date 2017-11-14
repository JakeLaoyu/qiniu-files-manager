<style scoped lang="less">
.layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
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
    min-height: 200px;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
    max-width: 1200px;
    margin: 15px auto;
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
    &:hover {
        background: #DEDEDE;
    }
    &>img{
        vertical-align: middle;
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
</style>
<template>
<div class="layout">
    <Menu mode="horizontal" theme="light" active-name="1">
        <div class="layout-logo">七牛图床管理</div>
    </Menu>
    <div class="layout-breadcrumb">
        <Select v-model="bucketName" style="width:150px" @on-change="changeBucket">
            <Option v-for="item in bucketList" :value="item" :key="item">{{ item }}</Option>
        </Select>
        <Breadcrumb>
            <BreadcrumbItem>{{ bucketName }}</BreadcrumbItem>
            <BreadcrumbItem v-for="item in prefixs" :key="item">{{item}}</BreadcrumbItem>
        </Breadcrumb>
    </div>
    <div class="layout-content">
        <div class="layout-content-main">
            <Row :gutter="20">
                <Col span="4" class-name="item-image" v-if="prefixsStr">
                <div class="folder" @click="returnDirectory">
                    <img src="./assets/return.png" alt="">
                    <div class="folder-name">返回上一级</div>
                </div>
                </Col>

                <Col span="4" class-name="item-image" v-for="item in prefixsList" :key="item">
                <div class="folder" @click="clickPrefix(item)">
                    <img src="./assets/folder.png" alt="">
                    <div class="folder-name">{{ item }}</div>
                </div>
                </Col>

                <Col span="4" class-name="item-image" v-for="item in imageList" :key="item.key">
                <img :src=" domain + item.key" alt="">
                </Col>
            </Row>
        </div>
    </div>
    <div class="layout-copy">
        2017 &copy; Jake
    </div>


    <Modal v-model="inputAkSk" title="请输入秘钥" @on-ok="saveAkSk" :closable="false" :loading="true">
        <Input v-model="AccessKey" placeholder="AccessKey" style="width: 100%"></Input>
        <Input v-model="SecretKey" placeholder="SecretKey" style="width: 100%"></Input>
        <Input v-model="bucket" placeholder="bucket" style="width: 100%"></Input>
        <Input v-model="domain" placeholder="domain(http://blogimg.jakeyu.top/)" style="width: 100%"></Input>

        <div slot="footer">
            <Button type="info" size="large" long :loading="modal_loading" @click="saveAkSk">确定</Button>
        </div>
    </Modal>
</div>
</template>
<script>
import util from './libs/util'
export default {
    data() {
        return {
            inputAkSk: false,
            AccessKey: '',
            SecretKey: '',
            bucket: '',
            modal_loading: false,
            bucketList: [
                'test'
            ],
            bucketName: '',
            imageList: [],
            prefixsList: [],
            prefixs: [],
            prefixsStr: '',
            domain: localStorage.domain || ''
        }
    },
    methods: {
        returnDirectory() {
            var currentDir = this.prefixs.pop()+'/'
            this.prefixsStr = this.prefixsStr.replace(currentDir, '')
            this.getList(this.prefixsStr)
        },
        // 点击文件夹
        clickPrefix(prefix) {
            this.prefixs.push(prefix)
            this.prefixsStr += prefix + '/'
            this.getList(this.prefixsStr)
        },
        // 保存 modal内容
        saveAkSk() {
            if (this.AccessKey && this.SecretKey && this.bucket) {
                this.modal_loading = true;

                localStorage.accessKey = this.AccessKey
                localStorage.secretKey = this.SecretKey
                localStorage.bucket = this.bucket
                localStorage.domain = this.domain
                this.postSecret()
                this.inputAkSk = false
            } else {
                this.$Modal.warning({
                    content: '请填写完整'
                })
            }
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
            this.$Spin.show()
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
                    }

                    this.$Spin.hide()
                })
        }
    },
    created() {
        //do something after creating vue instance
        this.bucketName = this.bucketList[0]

        this.getList()
    }
}
</script>
