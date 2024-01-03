<script setup>
import Card from "@/components/Card.vue";
import {Message, Refresh, Select, User} from "@element-plus/icons-vue";
import {useStore} from "@/store";
import {computed, reactive, ref} from "vue";
import {accessHeader, get, post} from "@/net";
import {ElMessage} from "element-plus";
import axios from "axios";

const store = useStore()

const registerTime = computed(() => new Date(store.user.registerTime).toLocaleString())

const desc = ref('')
const baseFormRef = ref()
const emailFormRef = ref()
const baseForm = reactive({
  username: '',
  gender: 1,
  phone: '',
  qq: '',
  wx: '',
  desc: ''
})
const emailForm = reactive({
  email: '',
  code: ''
})
const validateUsername = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please type username'))
  } else if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
    callback(new Error('Username can only contain letters and numbers'))
  } else {
    callback()
  }
}
const rules = {
  username: [
    {validator: validateUsername, trigger: ['blur', 'change']},
    {min: 2, max: 20, message: 'Username length should between 2 to 20 characters', trigger: ['blur', 'change']},
  ], email: [
    {required: true, message: 'Please type email', trigger: 'blur'},
    {type: 'email', message: 'Invalid email', trigger: ['blur', 'change']}
  ]
}

const loading = reactive({
  form: true,
  base: false
})

function saveDetails() {
  baseFormRef.value.validate(isValid => {
    if (isValid) {
      loading.base = true
      post('/api/user/save-details', baseForm, () => {
        ElMessage.success('Saved Successfully!')
        store.user.username = baseForm.username
        desc.value = baseForm.desc
        loading.base = false
      }, (message) => {
        ElMessage.warning(message)
        loading.base = false
      })
    }
  })
}

get('/api/user/details', data => {
  baseForm.username = store.user.username
  baseForm.gender = data.gender
  baseForm.phone = data.phone
  baseForm.wx = data.wx
  baseForm.qq = data.qq
  baseForm.desc = desc.value = data.desc
  emailForm.email = store.user.email
  loading.form = false
})

const coldTime = ref(0)
const isEmailValid = ref(true)
const onValidate = (prop, isValid) => {
  if (prop === 'email')
    isEmailValid.value = isValid
}

function sendEmailCode() {
  emailFormRef.value.validate(isValid => {
    if (isValid) {
      coldTime.value = 60
      get(`/api/auth/ask-code?email=${emailForm.email}&type=modify`, () => {
        ElMessage.success(`Code has been sent to: ${emailForm.email}, please check!`)
        const handle = setInterval(() => {
          coldTime.value--
          if (coldTime.value === 0) {
            clearInterval(handle)
          }
        }, 1000)
      }, (message) => {
        ElMessage.warning(message)
        coldTime.value = 0
      })
    }
  })
}

function modifyEmail() {
  emailFormRef.value.validate(isValid => {
    if (isValid) {
      post('/api/user/modify-email', emailForm, () => {
        ElMessage.success('Updated Successfully!')
        store.user.email = emailForm.email
        emailForm.code = ''
      })
    }
  })
}

function beforeAvatarUpload(rawFile) {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Avatar can only be in JPEG/PNG format')
    return false
  } else if (rawFile.size / 1024 > 300) {
    ElMessage.error('File size cannot exceed 300KB')
    return false
  }
  return true
}

function uploadSuccess(response) {
  ElMessage.success('Avatar Uploaded Successfully!')
  store.user.avatar = response.data
}

</script>

<template>
  <div style="display: flex;max-width: 950px;margin: 0 auto">
    <div class="settings-left">
      <card :icon="User" title="Account Info Settings" desc="Edit your account info here..."
            v-loading="loading.form">
        <el-form :model="baseForm" :rules="rules" ref="baseFormRef" label-position="top"
                 style="margin: 0 10px 10px 10px">
          <el-form-item label="Username" prop="username">
            <el-input v-model="baseForm.username" maxlength="10"/>
          </el-form-item>
          <el-form-item label="Gender">
            <el-radio-group v-model="baseForm.gender">
              <el-radio :label="1">Male</el-radio>
              <el-radio :label="0">Female</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Phone" prop="phone">
            <el-input v-model="baseForm.phone" maxlength="11"/>
          </el-form-item>
          <el-form-item label="QQ" prop="qq">
            <el-input v-model="baseForm.qq" maxlength="13"/>
          </el-form-item>
          <el-form-item label="Wechat" prop="wx">
            <el-input v-model="baseForm.wx" maxlength="20"/>
          </el-form-item>
          <el-form-item label="Profile" prop="desc">
            <el-input v-model="baseForm.desc" type="textarea" :rows="6" maxlength="200"/>
          </el-form-item>
          <div>
            <el-button :icon="Select" @click="saveDetails" :loading="loading.base"
                       type="success" plain>Save
            </el-button>
          </div>
        </el-form>
      </card>
      <card style="margin-top: 10px" :icon="Message" title="Email"
            desc="Update the default email here...">
        <el-form :rules="rules" @validate="onValidate" :model="emailForm" ref="emailFormRef"
                 label-position="top" style="margin: 0 10px 10px 10px">
          <el-form-item label="Email" prop="email">
            <el-input v-model="emailForm.email"/>
          </el-form-item>
          <el-form-item prop="code">
            <el-row style="width: 100%" justify="space-between">
              <el-col :span="17">
                <el-input placeholder="Code" v-model="emailForm.code"/>
              </el-col>
              <el-col :span="6">
                <el-button type="success" style="width: 135px" :disabled="!isEmailValid || coldTime > 0"
                           @click="sendEmailCode" plain>
                  {{ coldTime > 0 ? 'After ' + coldTime + 's' : 'Get a Code' }}
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <div>
            <el-button :icon="Refresh" type="success" plain @click="modifyEmail">Update</el-button>
          </div>
        </el-form>
      </card>
    </div>
    <div class="settings-right">
      <div style="position: sticky;top: 20px">
        <card>
          <div style="text-align: center;padding: 5px 15px 0 15px">
            <el-avatar :size="70" :src="store.avatarUrl"/>
            <div style="margin: 5px 0">
              <el-upload
                  :action="axios.defaults.baseURL + '/api/image/avatar'"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :on-success="uploadSuccess"
                  :headers="accessHeader()">
                <el-button size="small" round>Modify Avatar</el-button>
              </el-upload>
            </div>
            <div style="font-weight: bold">Hello, {{ store.user.username }}</div>
          </div>
          <el-divider style="margin: 10px 0"/>
          <div style="font-size: 14px;color: grey;padding: 10px">
            {{ desc || 'No profile filled out' }}
          </div>
        </card>
        <card style="margin-top: 10px;font-size: 14px">
          <div>Register Time: {{ registerTime }}</div>
          <div style="color: grey">Welcome to our forum!</div>
        </card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-left {
  flex: 1;
  margin: 20px;
}

.settings-right {
  width: 300px;
  margin: 20px 30px 20px 0;
}
</style>
