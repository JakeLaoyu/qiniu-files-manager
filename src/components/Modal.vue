<template>
  <div>
    <Modal
      v-model="showModal"
      :mask-closable="false"
      :title="title"
      :closable="false"
    >
      <template v-if="type === 'addBucket' && !allBuckets.length">
        <Form
          ref="bucket"
          :model="bucket"
          :rules="ruleValidate"
          :label-width="90"
        >
          <FormItem label="AccessKey" prop="AccessKey">
            <Input
              v-model="bucket.AccessKey"
              placeholder="AccessKey"
              style="width: 100%"
            />
          </FormItem>
          <FormItem label="SecretKey" prop="SecretKey">
            <Input
              v-model="bucket.SecretKey"
              placeholder="SecretKey"
              style="width: 100%"
            />
          </FormItem>
        </Form>
      </template>

      <template v-if="allBuckets.length">
        <Table
          border
          :columns="columns"
          :data="allBuckets"
          @on-selection-change="selectionChange"
        />
      </template>

      <template v-if="type === 'move'">
        <Input
          v-model="moveTo"
          :placeholder="image ? image.key : '移动到的路径（必须是绝对路径）'"
          style="width: 100%"
        />
      </template>

      <div slot="footer">
        <Button type="ghost" @click="$emit('closeModal')" v-if="buckets.length">
          取消
        </Button>
        <Button
          type="primary"
          :loading="loading || btnLoading"
          @click="handleSubmit"
        >
          {{ btnLoading ? "获取中" : "确定" }}
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { ajax } from '@/libs/util'
import { REGION } from '@/libs/constant'
export default {
  props: {
    type: String,
    title: String,
    isShow: Boolean,
    loading: Boolean,
    image: Object
  },
  data () {
    return {
      btnLoading: false,
      allBuckets: [],
      selectedBuckets: [],
      bucket: {},
      ruleValidate: {
        AccessKey: [{ required: true, message: '请填写Ak', trigger: 'blur' }],
        SecretKey: [{ required: true, message: '请填写Sk', trigger: 'blur' }]
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '空间名称',
          key: 'bucket'
        },
        {
          title: '域名',
          key: 'domains',
          render: (h, params) => {
            return h(
              'Select',
              {
                props: {
                  value: params.row.domain
                },
                on: {
                  'on-change': e => {
                    this.allBuckets[params.index].domain = e
                  }
                }
              },
              params.row.domains.map((item, index) =>
                h('Option', { props: { value: item } }, item)
              )
            )
          }
        },
        {
          title: '空间区域',
          key: 'region',
          render: (h, params) => {
            const region = Object.keys(REGION).map(key =>
              h(
                'Option',
                {
                  props: {
                    value: key
                  }
                },
                REGION[key]
              )
            )

            return h(
              'Select',
              {
                props: {
                  value: params.row.region
                },
                on: {
                  'on-change': e => {
                    this.allBuckets[params.index].region = e
                  }
                }
              },
              region
            )
          }
        },
        {
          title: '是否是私有空间',
          key: 'isPrivate',
          render: (h, params) => {
            return h(
              'Select',
              {
                props: {
                  value: params.row.isPrivate
                },
                on: {
                  'on-change': e => {
                    this.allBuckets[params.index].isPrivate = e
                  }
                }
              },
              [
                h(
                  'Option',
                  {
                    props: {
                      value: 0
                    }
                  },
                  '否'
                ),
                h(
                  'Option',
                  {
                    props: {
                      value: 1
                    }
                  },
                  '是'
                )
              ]
            )
          }
        }
      ],
      moveTo: this.image ? this.image.key : ''
    }
  },
  computed: {
    ...mapState(['buckets']),
    showModal () {
      return this.isShow
    }
  },
  watch: {
    image (val) {
      this.moveTo = val.key
    }
  },
  methods: {
    ...mapActions(['postSecrte']),
    selectionChange (selection) {
      this.selectedBuckets = selection
    },
    handleSubmit () {
      if (this.type === 'move') {
        this.ok()
        return
      }
      if (this.allBuckets.length) {
        if (!this.selectedBuckets.length) {
          return this.$Message.info('至少选中一个')
        }
        this.ok()
        return
      }
      this.$refs.bucket.validate(async valid => {
        if (valid) {
          this.btnLoading = true
          await this.postSecrte({
            accessKey: this.bucket.AccessKey,
            secretKey: this.bucket.SecretKey
          })
          const res = await ajax.get('/api/getBuckets')
          this.btnLoading = false
          if (res.code === 1) {
            this.allBuckets = res.data.map(item => {
              item['_checked'] = true
              item.domains = item.domains.map(i => `//${i}/`)
              item['domain'] =
                item.domains.filter(
                  item =>
                    !/(clouddn.com)|(qiniucdn.com)|(qiniudn.com)|(qnssl.com)|(qbox.me)$/.test(
                      item
                    )
                )[0] || item.domains[0]
              return item
            })
            this.selectedBuckets = this.allBuckets
          }
        }
      })
    },
    ok () {
      if (this.type === 'addBucket') {
        if (!this.selectedBuckets.length) return
        var check = this.buckets.filter(item => {
          return this.selectedBuckets.some(i => {
            return (
              item.AccessKey === i.AccessKey &&
              item.SecretKey === i.SecretKey &&
              item.bucket === i.bucket
            )
          })
        })

        if (check.length) {
          check.forEach(item => {
            this.$Message.error(`${item.bucket} 存在`)
          })
          return
        }

        this.selectedBuckets = this.selectedBuckets.map(item => {
          delete item._checked
          return item
        })

        this.$emit('ok', [...this.selectedBuckets])
        this.bucket = {}
        this.selectedBuckets = []
        this.allBuckets = []
        this.$Message.success('success')
      } else if (this.type === 'move') {
        if (!this.moveTo) {
          this.$Message.error('请填写新的名称')
          return
        }
        this.$emit('ok', this.moveTo)
      }
    }
  }
}
</script>
<style lang="less" scoped></style>
