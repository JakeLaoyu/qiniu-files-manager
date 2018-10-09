<template>
  <div>
    <Modal
      title="已选"
      :value="isShow"
      :mask-closable="false"
      :closable="false"
      @on-visible-change="visibleChange"
    >
      <Button v-if="showReset" class="reset-btn mb10" type="warning" @click="reset">重置</Button>

      <div class="table__wrap" :class="{ 'beautyScroll': isWin }">
        <Table border :columns="columns" :data="formatList"></Table>
      </div>

      <div slot="footer">
        <Button type="primary" size="large" long @click="handleSubmit">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { isWin } from '@/libs/util'
export default {
  props: ['list', 'isShow'],
  data () {
    return {
      isWin,
      formatList: [],
      showReset: false,
      columns: [{
        title: '文件名',
        key: 'name',
        render: (h, params) => {
          return h('a', {
            attrs: {
              href: `${this.currentBucket.domain}${params.row.name}`,
              target: '_blank'
            }
          }, params.row.name)
        }
      }, {
        title: '操作',
        key: 'operating',
        width: 100,
        render: (h, params) => {
          return h('Button', {
            props: {
              type: 'text',
              size: 'small'
            },
            on: {
              click: () => { this.toggleSelect(params.index) }
            }
          }, params.row.selected ? '取消选中' : '选中')
        }
      }]
    }
  },
  computed: {
    ...mapState([
      'currentBucket'
    ])
  },
  watch: {
    list () {
      this.formatList = this.list.map(item => { return { 'name': item, selected: true } })
    }
  },
  methods: {
    ...mapMutations([
      'saveState'
    ]),
    reset () {
      this.formatList = this.list.map(item => { return { 'name': item, selected: true } })
    },
    handleSubmit () {
      this.saveState({
        key: 'multipleSwitchFile',
        value: this.formatList.filter(item => item.selected).map(item => item.name)
      })
      this.$emit('close')
    },
    toggleSelect (index) {
      this.showReset = true
      this.formatList[index].selected = !this.formatList[index].selected
      this.$Message.success('操作成功')
    },
    visibleChange (val) {
      if (!val) this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.table__wrap {
  max-height: 500px;
  padding: 0 20px;
  overflow-y: scroll;
}
.reset-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
