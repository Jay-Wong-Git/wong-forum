<script setup>
import Card from "@/components/Card.vue";
import {Setting, Switch, Lock} from "@element-plus/icons-vue";
import {reactive, ref} from "vue";
import {get, post} from "@/net";
import {ElMessage} from "element-plus";

const form = reactive({
  password: '',
  new_password: '',
  new_password_repeat: ''
})
const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please retype password!'))
  } else if (value !== form.new_password) {
    callback(new Error("Passwords don't match!"))
  } else {
    callback()
  }
}
const rules = {
  password: [
    {required: true, message: 'Please type old password', trigger: 'blur'}
  ],
  new_password: [
    {required: true, message: 'Please type new password', trigger: 'blur'},
    {min: 6, max: 20, message: 'Password length should between 6 to 20 characters', trigger: ['blur']}
  ],
  new_password_repeat: [
    {required: true, message: 'Please retype new password', trigger: 'blur'},
    {validator: validatePassword, trigger: ['blur', 'change']},
  ]
}
const formRef = ref()
const valid = ref(false)

function resetPassword() {
  formRef.value.validate(valid => {
    if (valid) {
      post('/api/user/change-password', {...form, newPassword: form.new_password}, () => {
        ElMessage.success('Updated Successfully!')
        formRef.value.resetFields();
      })
    }
  })
}

const saving = ref(true)
const privacy = reactive({
  phone: false,
  wx: false,
  qq: false,
  email: false,
  gender: false
})
get('/api/user/privacy', data => {
  privacy.phone = data.phone
  privacy.email = data.email
  privacy.wx = data.wx
  privacy.qq = data.qq
  privacy.gender = data.gender
  saving.value = false
})
function savePrivacy(type, status) {
  saving.value = true
  post('/api/user/save-privacy', {
    type: type,
    status: status
  }, () => {
    ElMessage.success('Updated Successfully!')
    saving.value = false
  })
}
</script>

<template>
  <div style="margin: auto;max-width: 600px">
    <div style="margin-top: 20px">
      <card :icon="Setting" title="Privacy Settings" desc="Check the content blew you allow others to view..."
            v-loading="saving">
        <div class="checkbox-list">
          <el-checkbox @change="savePrivacy('phone', privacy.phone)"
                       v-model="privacy.phone">show my phone number
          </el-checkbox>
          <el-checkbox @change="savePrivacy('email', privacy.email)"
                       v-model="privacy.email">show my email address
          </el-checkbox>
          <el-checkbox @change="savePrivacy('wx', privacy.wx)"
                       v-model="privacy.wx">show my WeChat handle
          </el-checkbox>
          <el-checkbox @change="savePrivacy('qq', privacy.qq)"
                       v-model="privacy.qq">show my QQ handle
          </el-checkbox>
          <el-checkbox @change="savePrivacy('gender', privacy.gender)"
                       v-model="privacy.gender">show my gender
          </el-checkbox>
        </div>
      </card>
      <card style="margin: 20px 0" :icon="Setting"
            title="Update Password" desc="Update your password and keep it carefully...">
        <el-form :rules="rules" :model="form" ref="formRef" label-width="100" style="margin: 20px">
          <el-form-item label="Old Pass" prop="password">
            <el-input type="password" :prefix-icon="Lock" v-model="form.password"
                      placeholder="Old Password" maxlength="16"/>
          </el-form-item>
          <el-form-item label="New Pass" prop="new_password">
            <el-input type="password" :prefix-icon="Lock" v-model="form.new_password"
                      placeholder="New Password" maxlength="16"/>
          </el-form-item>
          <el-form-item label="New Pass" prop="new_password_repeat">
            <el-input type="password" :prefix-icon="Lock" v-model="form.new_password_repeat"
                      placeholder="Retype New Password" maxlength="16"/>
          </el-form-item>
          <div style="text-align: center">
            <el-button @click="resetPassword" :icon="Switch" type="success" plain>Confirm to Update</el-button>
          </div>
        </el-form>
      </card>
    </div>
  </div>
</template>

<style scoped>
.checkbox-list {
  margin: 10px 0 0 10px;
  display: flex;
  flex-direction: column;
}
</style>
