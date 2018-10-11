<template>
  <div class="search">
    <div class="search__input">
      <Input v-model="searchValue" icon="ios-search" size="large" placeholder="关键字" @on-enter="search"></Input>
    </div>
    <div class="search__result" :class="{ 'beautyScroll': isWin }">
      <Spin size="large" fix v-if="searching"></Spin>
      <div class="search__prompt" v-if="searchOver">
        {{searchResult.length === 0 ? '没有搜索到相关内容' : `共计 ${searchResult.length} 条搜索结果` }}
      </div>
      <Row :gutter="20" v-if="searchResult.length">
        <Col span="6" v-for="(item,index) in searchResult" :key="index" class-name="search__item">
          <qimSearchItem
          :item="item"
          :index="index"
          :domain="currentBucket.domain"
          @itemDetail="itemDetail"
          @preview="itemPreview"
          @delItem="delItem"
          >
          </qimSearchItem>
        </Col>
      </Row>
    </div>

    <Modal
        v-model="showDetail"
        title="信息"
        class-name="detail"
        :scrollable="true"
        >
        <div class="detail__info">
          <div class="detail__name">{{ detail.key.split('/')[detail.key.split('/').length - 1] }}</div>
          <div class="detail__url"><span>url:</span> {{ this.currentBucket.domain + detail.key }}</div>
          <div class="detail__fsize"><span>fsize:</span> {{ detail.fsize | FilterFsize }}</div>
          <div :class="`detail__${detailKey}`" v-for="detailKey in Object.keys(detail)" :key="detailKey" v-if="detailKey!=='fsize'"><span>{{detailKey}}:</span> {{ detail[detailKey] }}</div>
        </div>
        <div slot="footer">
          <Button type="primary" size="large" long @click="showDetail=false">确定</Button>
        </div>
    </Modal>

    <Modal
        v-model="showImg"
        title="预览"
        class-name="detail"
        >
        <div class="detail__img">
          <Spin size="large" fix v-if="imgLoading"></Spin>
          <img v-lazy="`${this.currentBucket.domain + detail.key}`" v-if="detail.mimeType.split('/')[0]==='image'">
          <div class="dplayer__wrap" v-show="detail.mimeType.split('/')[0]==='video'">
            <div id="dplayer"></div>
          </div>
          <QimIcon
            v-if="!['video','image'].includes(detail.mimeType.split('/')[0])"
            :icon="detail.mimeType.split('/')[detail.mimeType.split('/').length-1]"
            size="80"
            />
        </div>
        <div slot="footer">
          <Button type="primary" size="large" long @click="showImg=false">确定</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import {
  mapState,
  mapActions
} from 'vuex'
import { isWin } from '@/libs/util'
import DPlayer from 'dplayer'
import 'dplayer/dist/DPlayer.min.css'

export default {
  data () {
    return {
      isWin,
      searching: false,
      searchValue: '',
      searchOver: false,
      showDetail: false,
      imgLoading: false,
      showImg: false,
      searchResult: [], // 搜索结果
      detail: {
        key: '',
        mimeType: ''
      }
    }
  },
  computed: {
    ...mapState([
      'currentBucket'
    ])
  },
  watch: {
    currentBucket () {
      this.searching = false
      this.searchValue = ''
      this.searchOver = false
      this.searchResult = []
    },
    detail (val, oldVal) {
      if (this.detail.mimeType.split('/')[0] === 'image' && val.key !== oldVal.key) {
        this.imgLoading = true
      } else if (this.detail.mimeType.split('/')[0] === 'video' && val.key !== oldVal.key) {
        this.videoInit()
      }
    }
  },
  methods: {
    ...mapActions([
      'getList'
    ]),
    videoInit () {
      this.dp = new DPlayer({
        container: document.getElementById('dplayer'),
        autoplay: false,
        preload: false,
        lang: 'zh-cn',
        video: {
          url: this.currentBucket.domain + this.detail.key
        }
      })
    },
    delItem (key) {
      var indexOfStevie = this.searchResult.findIndex(i => i.key === key)
      if (indexOfStevie !== -1) {
        this.searchResult.splice(indexOfStevie, 1)
      }
    },
    itemPreview (item) {
      this.showImg = true
      this.detail = item
    },
    itemDetail (item) {
      this.showDetail = true
      this.detail = item
    },
    async search () {
      this.searching = true
      const { images } = await this.getList({
        search: this.searchValue
      })
      this.searchResult = images
      this.searching = false
      this.searchOver = true
    }
  }
}
</script>
<style lang="less" scoped>
.search {
  width: 1200px;
  margin: 0 auto;
  height: calc(~"100vh - 60px");
  box-sizing: border-box;
  padding-top: 30px;
  &__input {
    width: 720px;
    margin: 0 auto;
  }
  &__prompt {
    text-align: center;
    margin-bottom: 20px;
  }
  &__result {
    height: calc(~"100% - 56px");
    box-sizing: border-box;
    margin-top: 20px;
    padding: 0 20px;
    overflow-y: scroll;
    position: relative;
  }
  &__item {
    height: 275px;
    margin-bottom: 20px;
  }
}

.detail {
  &__img {
    text-align: center;
    position: relative;
    min-height: 100px;
    img {
      max-width: 100%;
    }
  }
  &__info > div {
    word-break: break-all;
    margin-bottom: 10px;
    span {
      color: #333;
    }
  }
  &__name {
    font-size: 18px;
    color: red;
  }
}
</style>
