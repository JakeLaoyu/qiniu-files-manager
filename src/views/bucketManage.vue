<template>
<div>
    <Menu mode="horizontal" ref="menu" theme="light" :active-name="activeMenu" @on-select="changeMenu">
        <div class="layout-nav">
            <MenuItem name="aksk">
            <Icon type="ios-navigate"></Icon>
            AccessKey/SecretKey
            </MenuItem>
            <MenuItem v-for="item in bucketList" :key="item" :name="item">
            <Icon type="cube"></Icon>
            {{item}}
            </MenuItem>

            <Button type="primary" @click="addbucketModal=true">添加Bucket</Button>
        </div>
    </Menu>
    <div class="layout-content">
        <div class="layout-content-main">
            <div class="input-item">
                <div class="label">{{input.input1Lbale}}</div>
                <Input v-model="input.input1Value" ></Input>
            </div>
            <div class="input-item">
                <div class="label">{{input.input2Lbale}}</div>
                <Input v-model="input.input2Value" ></Input>
            </div>

            <div class="btns">
                <Button type="primary" @click="submit">提交</Button>
                <Button type="error" v-if="activeMenu != 'aksk'" @click="del">删除</Button>
            </div>
        </div>
    </div>


    <Modal v-model="delConfirm" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>是否删除</span>
        </p>
        <div style="text-align:center;font-size: 14px;">
            <p>是否删除: <span style="color: rgb(255, 102, 0);">{{activeMenu}}</span></p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" @click="deltrue">删除</Button>
            <Button type="success" size="large" @click="delConfirm=false">取消</Button>
        </div>
    </Modal>
    <addbucket :isShow="addbucketModal" @closeModal="addbucketModal=false" @addbucket="saveAddBucketModal"></addbucket>
</div>
</template>
<script>
import addbucket from '../components/addbucket.vue'
export default {
    components:{
        addbucket
    },
    data() {
        return {
            addbucketModal: false,
            delConfirm: false,
            activeMenu: 'aksk',
            AccessKey: localStorage.accessKey||'',
            SecretKey: localStorage.secretKey||'',
            bucketList: JSON.parse(localStorage.bucketList||'[]'),
            domainObj: JSON.parse(localStorage.domainObj||'{}'),
            input:{
                input1Value:localStorage.accessKey||'',
                input2Value:localStorage.secretKey||'',
                input1Lbale:'AccessKey',
                input2Lbale:'SecretKey'
            }
        }
    },
    methods: {
        saveAddBucketModal(newbucket, domain) {
            this.bucketList.push(newbucket)
            localStorage.bucketList = JSON.stringify(this.bucketList)
            this.domainObj[newbucket] = domain
            localStorage.domainObj = JSON.stringify(this.domainObj)
            this.$Message.success('添加成功')
            this.addbucketModal = false
        },
        addbucket() {
            this.input.input1Lbale = 'Bucket'
            this.input.input1Value = ''
            this.input.input2Lbale='Domain'
            this.input.input2Value = ''
        },
        del() {
            this.delConfirm = true
        },
        deltrue() {
            if(this.bucketList.indexOf(this.activeMenu)>0){
                this.bucketList.splice(this.bucketList.indexOf(this.activeMenu),1)
                localStorage.bucketList = JSON.stringify(this.bucketList)
                delete this.domainObj[this.activeMenu]
                localStorage.domainObj = JSON.stringify(this.domainObj)
                localStorage.bucket = this.bucketList[0]
                localStorage.domain = this.domainObj[localStorage.bucket]

                this.activeMenu = 'aksk'

                this.input.input1Value=localStorage.accessKey
                this.input.input2Value=localStorage.secretKey
                this.input.input1Lbale='AccessKey'
                this.input.input2Lbale='SecretKey'
            }

            this.delConfirm = false
        },
        submit() {
            if(!this.input.input1Value||!this.input.input2Value){
                return this.$Message.error('请填写完整');
            }

            var bucket = this.activeMenu
            var domain = this.input.input2Value[this.input.input2Value.length-1] !='/'?this.input.input2Value+'/':this.input.input2Value

            if(domain.substr(0,4)!='http'){
                return this.$Message.error('Domain 格式不正确');
            }

            if(this.input.input1Value !=this.activeMenu&& this.bucketList.indexOf(this.input.input1Value)>=0){
                return this.$Message.error('Bucket 存在');
            }

            if(this.activeMenu=='aksk'){
                localStorage.accessKey = this.input.input1Value
                localStorage.secretKey = this.input.input2Value
            }else{
                localStorage.bucket = bucket
                this.bucketList.splice(this.bucketList.indexOf(bucket),1,this.input.input1Value)
                localStorage.bucketList = JSON.stringify(this.bucketList)

                delete this.domainObj[bucket]
                localStorage.domain = domain
                this.domainObj[this.input.input1Value] = domain
                localStorage.domainObj = JSON.stringify(this.domainObj)
            }

            this.$Message.success('保存成功');
        },
        changeMenu(name) {
            console.log(name)
            this.activeMenu = name

            if(name=="aksk"){
                this.input.input1Value=localStorage.accessKey
                this.input.input2Value=localStorage.secretKey
                this.input.input1Lbale='AccessKey'
                this.input.input2Lbale='SecretKey'
            }else{
                this.input.input1Lbale = 'Bucket'
                this.input.input1Value = name
                this.input.input2Lbale='Domain'
                this.input.input2Value = this.domainObj[name]
            }
        }
    }
}
</script>
<style lang="less" scoped>
.layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
}
.layout-logo {
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
}
.layout-nav {
    display: inline-block;
}
.layout-assistant {
    width: 300px;
    margin: 0 auto;
    height: inherit;
}
.layout-breadcrumb {
    padding: 10px 15px 0;
}
.layout-content {
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
    min-height: calc(~"100vh - 90px");
    margin: 15px auto 0;
    width: 1200px;
}
.layout-content-main {
    padding: 10px;
    width: 500px;
    margin: 50px auto 0;
    .input-item{
        margin-bottom: 20px;
    }
    .label{
        margin-bottom: 5px;
        font-size: 14px;
    }
}
.layout-copy {
    text-align: center;
    padding: 10px 0 20px;
    color: #9ea7b4;
}
.ivu {
    &-menu {
        text-align: center;
    }
}
</style>
