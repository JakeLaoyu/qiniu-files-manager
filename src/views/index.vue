<template>
<div>
    <div class="layout-breadcrumb">
        <Select v-model="bucketName" style="width:150px" @on-change="changeBucket">
            <Option :value="item" v-for="item in bucketList" :key="item" >{{ item }}</Option>
        </Select>

        <Button class="add-bucket" @click="addbucket" type="primary">添加Bucket</Button>

        <Breadcrumb>
            <BreadcrumbItem>{{ bucketName }}</BreadcrumbItem>
            <BreadcrumbItem v-for="item in prefixs" :key="item">{{item}}</BreadcrumbItem>
        </Breadcrumb>
    </div>
    <div class="layout-content">
        <div class="layout-content-main">
            <Row :gutter="20">
                <Col span="16" push="8" ref="contentmain">
                <Row :gutter="20" v-if="qiniuRight">
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
                        <vue-lazy-load-img mode="diy" :time="300" :done="true" :position="{ top: 0, right: 0, bottom: 0, left: 0 }" :diy="{ backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }" @error="imgloadError">
                            <img src="../assets/File-Loading.png" :data-src="domain + item.key+'?imageView2/1/w/113/h/113'" alt="">
                        </vue-lazy-load-img>
                    </div>
                    </Col>
                </Row>
                <div class="qiniu-error" v-else>{{errorText}}</div>
                </Col>


                <Col span="8" pull="16" class-name="left-part">
                <upload :prefix="prefixsStr" @uploadfinish="uploadfinish"></upload>

                <transition name="fade">
                    <div class="detail" v-if="showDetail" ref="detail" :style="detailDomFixed">
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

    <addbucket :isShow="addbucketModal" @closeModal="closeAddBucketModal" @addbucket="saveAddBucketModal"></addbucket>
</div>
</template>
<script>
import util from '../libs/util'
import inputAkSk from '../components/inputAkSk.vue'
import upload from '../components/upload.vue'
import addbucket from '../components/addbucket.vue'
import Clipboard from 'clipboard'
export default {
    components: {
        inputAkSk,
        upload,
        addbucket
    },
    data() {
        return {
            moveTo: '',
            qiniuRight: true,
            errorText: '',
            moveModal: false,
            addbucketModal: false,
            showDetail: false,
            inputAkSk: false,
            delLoading: false,
            moveLoading: false,
            replaceLoading: false,
            bucketName: localStorage.bucket || '',
            bucketList: [],
            imageList: [],
            prefixsList: [],
            prefixs: [],
            prefixsStr: '',
            domain: localStorage.domain || '',
            detailImage: {},
            detailDomFixed: {}
        }
    },
    methods: {
        imgloadError(event) {
            event.src =
                `data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAALCklEQVR4Xu2da2wcVxXH/2dmZxwr
                JUoDSUzs3SZNnF2X8hCPCqoQVFEkGiCxSqqgIj6A0kpQVBCthKioyusD0CoSVLxBfGirSE2jEAiP
                VkFVaVQKiCIIqr1xmsfuxlUhTdMmTuuZnTnobrypE7w7Z7yz63nc/ej9z7nnnv9v7ty5vjNLmOfn
                8EqscPusUQI2gnE1A0NE9MZ5hkvsYQz+2UjFvTWpHaCwiVeH0D9l2PeA+XYQ9Yc9Po16Bj9j1d3R
                dZOoJq1/oQA4uhRLX1ti7SfQu5LW0W7ny8wvks83lU7UH+92W1HGFwMwsQxL6ovtvxFhfZQJpC4W
                +3eXqvVvJaVfIgAYMMoFaz9A1yWlYwuZJwP76Jxzc+kkzixkHpK2RQCM5XN3EBn3SQJqzUwFGM+Z
                hM3DFefZONckEICJASyvW9YRIroszh2JY27MfA6g7SNVZ2cc81M5BQJQHrJuYYN+GtcOJCEvAt+/
                vuJ+iYB63PINBGCsYD9CwMfbJs78Octzf7t2EpW4dbDTfMYLNv9fjOZfAqs3+0h+yid361XH8Xyn
                OUV5fGAXxvP2YRDWtmyU+bOlqvvjKJOKU6w5AZhJkMBghgciU5Qz83+J+MZipX5ApO+BKBiAgvUy
                QEta5UJ1Z3lxEid7kOuCNNEOAJUQe/61ZNBeEC2XJMjMdQP85WK1vkOi77ZGAMAcQ+CsrEoVJzBG
                tzvRzfhBAKj+H12OgelF1i4QbQiRy66l086nB17AVIhjIpcGmicpQORZxSigtP8MmON56ztEdEeI
                9MvsOZtHTuBQiGMilWoAAsopBaAZZqxgfoxgPATQGyROMfOUwf6nijVvj0QftUYDEDEAKtzYAFaT
                bf8OwEgIw75brDh3EeCFOKZjqQagCwCokEdXY9G0Z/0CRDeLXWJ+cjG7o/kaTomP6VCoAegSAK9f
                EqxbCfg+QH0irxg10+Mtw5PuMyJ9hyINQJcBUOEPDVrv8AzaS4SCxC8GO8T4Yqnq/kii70SjAegB
                AKqJxr/TL7N2E+h6uWH8gFdxt78FcOTHhFNqAHoEgGqGASrnc3cB9A0QGSKrmP9pee7mbi2zawB6
                CECzqUP53EYPtIeIlokgAJ9m5m0j1fpjMr1cpQFYAABUk+N5rAKsPSC6RmQXMzPRN0sV52vUGEyi
                +WgAFgiAmUtCrjxk3QeDviC2k/GoddbZtvYlvCw+po1QA7CAADSbVquHYGMnES2WmMrAcfKxuVRz
                /iXRt9NoAGIAgErh8BDW1Q371/LVQ56GT9tLNefBTiDQAMQEAJVGY/XQtx8AsFVsKvNPvKp7+3xv
                FTUAMQKgmUo5b93mE3YQyJaAwOC/G767pVjDCYl+tkYDEEMAVEpq9dA3aB8IgxJT5/tgigYgpgCo
                tI4XcPk5WA+LVw+ZPSL+arFS/7YEGqXRAMQYgJlbRRov2PcQ893S1cMwD6ZoAGIOwIV5wWDug75B
                D4tXD4UPpmgAEgJA41ZxFfJ109oNovfIhng+U6q4LTf06kuAoIpBW8IEIaKVsFoHZhAFnrtQe9ZL
                VbetMDBKUAGyvis4WncjjqYB6LygQSdA5y10N0LQCapHgA7nAN21LyA6qx0GbSzUI0Dn9sR6BNAA
                dG5wUAQNwFxPx86qWtA1JqjAcf9eA6ABiGz3TeSw60tA5CVNVMDz726yWz9JxMylqtt286m+C0iU
                5RcnqwFIsHlRpK4BiKKKCY6hAUiweVGkrgGIoooJjqEBSLB5UaSeeQDKQ+YNDOJSrf6HKAoaNoZq
                3yfyR6r1R8MeG4U+0wCUh8xNvmH8ShXSBG9aX6nvj6Ko0hiHCrnrPZB6C8iCtK/azSwADfPJ2EtE
                ufOFYLeXEDTNJ5DVbN/w/dFizWsA0atPJgEo581RH8aupvnNYvcKgkvNv9C+ev8f+1t6CUHmACjn
                7W0MfqjVmzm7DUEr8y+CAP5NxarXuDR1+5MpAMYK5kcJ5m8kRSXf21Sseb+XaKWaQ4PmR3zT3CfS
                +/4NvZiYZgqAmVesPE6gdwaZEPVIEHTmz85H/X5Q7qx73fApvBKUZ6ffZwoAVayFgCCu5mf2LqCX
                EMTZ/MwC0KuRoLnO0LzVazdc93LYv/hyk+H9AN0cCS5dZ4ij+ZkeAZqGKAi8xdYBEL01aEIlnRgm
                xXwNwIzj6hHqV9l6QgpBuxW7JJmvAZh1yoeCoMWKXRjzwXzQnHI39OJWr/3lJ8NzgEsL0wkEYc3v
                J/cDV1TwUtBlp9vfZ24dIKig84FAxZz9j6W2bTAfjIv5+hLQwqkwEID5/JZqya9+xcx8DUCbUzUU
                BEHDSqPS8TrzmynrS0AQBLCfAlCSeNxSE1Pz9QggcLW8Cm/inP3kvCGIsfkaAAEASjJvCGJuvgZA
                CMAFCEz7HyAMiQ5jVPvJeXscbvX0OoDIsfYitY2MYTwimu035ny93941n27qSaCgamHNvzDDTgAE
                GoAAAOZrflIg0AC0AaBT8y+CoIcbPQWD2gWJBqBFtaIy//VKs0fwt/Zqt68UAg3AHJUKZT5jgggm
                A1cGFl29iTtmEGgALnEtlPnAONWd91t1mNN99gEirEsaBBqAWY6FMZ8Zhw3PeV9xEidViCMrsDKJ
                EGgAZgAIa37ftLPhyv/ghdlnfBIh0ACopd6Ax8Vmm6zO/LnMb2qSBkHmAZgxf6fk3elB5icRgkwD
                0A3zZ0PgLLKfBrA6zhPDzALQTfObhpeHMMiGfSDOEGQSgF6YnxQIMgdAL81PAgSZAkD9wDLBVL+t
                G/hREz42nI1XHcfzgWKBYGIQQ57Z2FkUPCdQe0y78H6CudLMFAAhHgM7Zr/mvPfS+3yBz20l4jlB
                Dx8ayRQAyp3Gbt/2Gz2Pke9smM9v6EoACYSgx9vIMgeAMknt8fNN+89zrN131XzBnGC8H861vdxG
                lkkAWqzd98T8iyAg++nmHsNL/7cgGU2i0GQWgCYEM4s16Oaw38qoI2/GFU7OPgBCvRtzDgkgmQZA
                FWhsAKstA966SVQlBYtaM74Sa8wc3OETqEUdWxIv8wBIipRmjQYgze4K+qYBEBQpzRINQJrdFfRN
                AyAoUpolGoA0uyvomwZAUKQ0SzQAaXZX0DcNgKBIaZZoANLsrqBvGgBBkdIs0QCk2V1B3zQAgiKl
                WaIBSLO7gr5pAARFSrNEA5BmdwV90wAIipRmiQYgze4K+qYBEBQpzRINQJrdFfRNAyAoUpolGoA0
                uyvomwZAUKQ0SzQAaXZX0DcNgKBIaZZoANLsrrBv4wWb20lLFYfafd/2S3XgWME6RaDLWwUx2Vk3
                XMVzwny1LMIKzLy4ovVjccwnS1V3eUcAjBfsZwGMtAzC/MNS1b0twn7pUMIKjOVzdxIZ97bx5mCp
                6r6tQwCsBwH6ZLsgzPwDm93vra1hQpi7lnVQAfVkspuzbmSiHW3DMP+yVHU/0xEA5bz9CSbs7CBf
                fegCVYB9b+tIzdvdEQATQF+9YB8jYGCB+qGbnU8FGLVi1VlDQL0jABoTwSHr82TQ/fPJQx+zMBUg
                n28p1tyfB7UeeBegAjTuN/PWEyDaEBRQfx+HCvAfixX3Q9Swrv1HBIAKod7QdY7tv4p+WCGoVf19
                NytQNs861wyfwiuSRsQANCF4la3HQPRuSXCt6W0FmPkvi864H15zGqelLYcCQAWtDqF/iuyvAHwn
                iPqlDWld9yrAzFMG0b3FivP1sK2EBqDZwOGVWOH2WaMEbATjagbyRLQsbAJaH74CzPwiUePFWP8m
                H3+C7+5p/vxN2Gj/A3K0QwgnMuzjAAAAAElFTkSuQmCC`
        },
        closeAddBucketModal() {
            this.addbucketModal = false
        },
        saveAddBucketModal(newbucket, domain) {
            this.bucketList.push(newbucket)
            localStorage.bucketList = JSON.stringify(this.bucketList)
            var domainObj = JSON.parse(localStorage.domainObj)
            domainObj[newbucket] = domain
            localStorage.domainObj = JSON.stringify(domainObj)
            this.$Message.success('添加成功')
            this.bucketName = newbucket
            this.addbucketModal = false
        },
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
                    if (res.data.code == 1) {
                        this.moveModal = false
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
        delImage() {
            this.delLoading = true
            var filename = this.detailImage.key

            this.$Modal.confirm({
                title: '确认删除',
                content: '是否删除: ' + '<span style="color:red;">' + filename + '</span>',
                loading: true,
                onOk: () => {
                    util.axios
                        .post('/api/delImage', {
                            key: this.detailImage.key,
                            bucket: this.bucketName
                        })
                        .then(res => {
                            if (res.data.code == 1) {
                                this.delLoading = false
                                var indexOfStevie = this.imageList.findIndex(i => i.key === this.detailImage.key);
                                this.imageList.splice(indexOfStevie, 1)
                                this.showDetail = false
                                this.detailImage = {}
                                this.$Message.success('删除成功');
                                this.$Modal.remove();
                            }
                        })
                },
                onCancel: () => {
                    this.delLoading = false
                }
            });
        },
        clickImage(image) {
            this.showDetail = true
            this.detailImage = {}
            this.getDetail(image.key)
        },
        returnDirectory() {
            var currentDir = this.prefixs.pop() + '/'
            this.prefixsStr = this.prefixsStr.replace(currentDir, '')
            this.getList(this.prefixsStr)
        },
        // 获取文件详情
        getDetail(key) {
            util.axios
                .get('/api/detail?key=' + key + '&bucket=' + localStorage.bucket)
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
            this.prefixs.push(prefix)
            this.prefixsStr += prefix + '/'
            this.getList(this.prefixsStr)
        },
        // 保存 modal内容
        inputAkSkFinish() {
            window.location.reload()
        },
        // 修改容器
        changeBucket() {
            this.showDetail = false
            this.detailImage = {}
            localStorage.bucket = this.bucketName
            var domainObj = JSON.parse(localStorage.domainObj)
            this.domain = localStorage.domain = domainObj[this.bucketName]
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
            this.initData()
            this.$Loading.start();
            prefix = prefix || ''
            util.axios
                .get("/api/getImages?bucket=" + localStorage.bucket + "&prefix=" + prefix + "&domain=" + localStorage.domain)
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
                    } else if (data.code == 3) {
                        if (localStorage.accessKey && localStorage.secretKey) {
                            this.postSecret()
                        } else {
                            this.inputAkSk = true
                        }
                    } else if (data.code) {
                        if (data.code == 401) {
                            this.postSecret()
                        }
                        this.qiniuRight = false
                        this.errorText = data.message
                    }

                    this.$Loading.finish();
                })
        },
        addbucket() {
            this.addbucketModal = true
        },
        initData() {
            this.qiniuRight = true
            this.prefixsList = []
            this.imageList = []
        },
        // 去抖函数
        debounce(fn, delay) {
            // 持久化一个定时器 timer
            let timer = null;
            // 闭包函数可以访问 timer
            return function() {
                // 通过 'this' 和 'arguments'
                // 获得函数的作用域和参数
                let context = this;
                let args = arguments;
                // 如果事件被触发，清除 timer 并重新开始计时
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            }
        },
        handleScroll() {
            var documentHeight = document.documentElement.clientHeight
            var contentMainDomClientRect = this.$refs.contentmain.$vnode.elm.getBoundingClientRect()
            if (this.$refs.detail && this.$refs.contentmain.$vnode) {
                var detailDom = this.$refs.detail
                var clientRect = detailDom.getBoundingClientRect()
                if (window.scrollY >= 218&&!detailDom.style.position) {
                    console.log('csstext')
                    var csstext = "position:fixed;top:0;left:" + (contentMainDomClientRect.x - 10 - clientRect.width) + 'px;width:' + clientRect.width + 'px;'
                    detailDom.style = clientRect.height >= documentHeight ? csstext + 'height:' + documentHeight + 'px;overflow:scroll;' : csstext
                } else if(window.scrollY < 218&&detailDom.style.position){
                    detailDom.style = ''
                }
            }
        }
    },
    created() {
        //do something after creating vue instance
        this.getList()
        if (localStorage.bucketList) {
            this.bucketList = JSON.parse(localStorage.bucketList)
        }
    },
    mounted() {
        window.addEventListener('scroll', this.debounce(this.handleScroll,100))
        window.addEventListener('resize', this.debounce(this.handleScroll,100))
    }
}
</script>
<style scoped lang="less">
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
    width: 1200px;
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
    font-size: 0;
    & > img {
        vertical-align: middle;
    }
    // &:after {
    //     content: '';
    //     display: inline-block;
    //     vertical-align: middle;
    //     height: 100%;
    // }
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
.add-bucket {
    float: left;
    margin-right: 20px;
}
.qiniu-error {
    height: 110px;
    line-height: 110px;
    color: #ed3f14;
    text-align: center;
    background: #fff;
    font-size: 18px;
}
</style>
