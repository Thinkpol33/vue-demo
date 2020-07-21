<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="addRoleDialog = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="rolesList"
                border
                stripe
                row-key="id">
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!--渲染一级权限-->
            <el-row :class="['bdbottom','vcenter',index===0 ? 'bdtop' : '']"
                    v-for="(item1,index) in scope.row.children"
                    :key="item1.id">
              <el-col :span="5">
                <el-tag closable
                        @close="deleteRoleById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <!--嵌套渲染二级权限-->
                <el-row :class="['vcenter',index===0 ? '' : 'bdtop']"
                        v-for="(item2,index) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="deleteRoleById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!--嵌套渲染三级权限-->
                    <el-tag type="warning"
                            closable
                            v-for="(item3) in item2.children"
                            :key="item3.id"
                            @close="deleteRoleById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作"
                         width="300">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit"
                       size="mini"
                       type="primary">编辑</el-button>
            <el-button icon="el-icon-delete"
                       size="mini"
                       type="danger"
                       @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button icon="el-icon-setting"
                       size="mini"
                       type="warning"
                       @click="setRight(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--分配权限对话框-->
    <el-dialog title="添加角色"
               :visible.sync="setRightDialog"
               width="50%"
               @close="setRightDialogClose">
      <el-tree ref="treeRef"
               :data="rightsList"
               :props="treeProps"
               node-key="id"
               show-checkbox
               default-expand-all
               :default-checked-keys="defKeys"></el-tree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary"
                   @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!--添加权限对话框-->
    <el-dialog title="添加角色"
               :visible.sync="addRoleDialog"
               width="30%"
               @close="roleDialogClose">
      <el-form ref="addRoleFormRef"
               :model="addRoleForm"
               :rules="addRoleFormRules"
               label-width="70px">
        <el-form-item prop="roleName"
                      label="名称">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc"
                      label="描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary"
                   @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      roleId: '',
      rolesList: [],
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点的id值数组
      defKeys: [],
      // 添加角色对话框是否显示
      addRoleDialog: false,
      // 分配权限对话框是否显示
      setRightDialog: false,
      // 添加角色参数
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: false, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 删除权限标签
    async deleteRoleById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      role.children = res.data
    },
    // 通过递归函数，获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 判断当前节点是不是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 展示分配权限树形对话框
    async setRight (role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightsList = res.data

      this.getLeafKeys(role, this.defKeys)

      this.roleId = role.id
      this.setRightDialog = true
    },
    // 重置defKeys数组
    setRightDialogClose () {
      this.defKeys = []
    },
    // 分配权限
    async allotRights () {
      const keys = [...this.$refs.treeRef.getHalfCheckedKeys(), ...this.$refs.treeRef.getCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialog = false
    },
    // 添加用户
    async addRole () {
      const { data: res } = await this.$http.post('roles', this.addRoleForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加用户失败')
      }
      this.$message.success('添加用户成功')
      this.addRoleDialog = false
      this.getRolesList()
    },
    // 关闭添加用户对话框后清除表单参数
    roleDialogClose () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 删除角色
    async deleteRole (id) {
      const confirmResult = await this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped="">
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
