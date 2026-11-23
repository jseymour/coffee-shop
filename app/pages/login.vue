<script setup lang="ts">
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await $fetch('/api/auth', {
      method: 'POST',
      body: { password: password.value }
    })
    await navigateTo('/admin')
  } catch {
    error.value = 'Invalid admin password.'
  }
}
</script>

<template>
  <div class="login-box">
    <h2>Admin Access</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="password" type="password" placeholder="Enter admin password" required />
      <button type="submit" class="primary">Login</button>
    </form>
    <p v-if="error" class="err">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-box {
  max-width: 360px;
  margin: 3rem auto;
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0dcd3;
}
form { display: flex; gap: 0.5rem; }
input { flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
.err { color: #b91c1c; margin-top: 0.75rem; }
</style>