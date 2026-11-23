<script setup lang="ts">
import type { CoffeeItem } from '~~/server/utils/db'

definePageMeta({
  middleware: 'admin'
})

const store = useShopStore()
await useAsyncData('admin-menu', () => store.fetchMenu())

const newItem = reactive({
  name: '',
  description: '',
  priceUSD: 4.0,
  stock: 10
})

async function addItem() {
  if (!newItem.name.trim()) return
  store.menu = await $fetch<CoffeeItem[]>('/api/menu', {
    method: 'POST',
    body: { action: 'add', ...newItem }
  })
  newItem.name = ''
  newItem.description = ''
  newItem.priceUSD = 4.0
  newItem.stock = 10
}

async function updateItem(item: CoffeeItem) {
  store.menu = await $fetch<CoffeeItem[]>('/api/menu', {
    method: 'POST',
    body: { action: 'update', ...item }
  })
}

async function deleteItem(id: string) {
  store.menu = await $fetch<CoffeeItem[]>('/api/menu', {
    method: 'POST',
    body: { action: 'delete', id }
  })
}

function logout() {
  const cookie = useCookie('admin_session')
  cookie.value = null
  navigateTo('/')
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h2>Admin Menu &amp; Inventory Control</h2>
      <button @click="logout">Logout to Storefront</button>
    </div>

    <!-- Add New Drink -->
    <form class="add-form" @submit.prevent="addItem">
      <input v-model="newItem.name" placeholder="Coffee Name" required />
      <input v-model="newItem.description" placeholder="Description" required />
      <input v-model.number="newItem.priceUSD" type="number" step="0.25" min="0.5" placeholder="USD Price" required />
      <input v-model.number="newItem.stock" type="number" min="0" placeholder="Stock" required />
      <button type="submit" class="primary">Add Drink</button>
    </form>

    <!-- Manage Existing Inventory & Pricing -->
    <table class="admin-table">
      <thead>
      <tr>
        <th>Drink</th>
        <th>Description</th>
        <th>Base Price (USD)</th>
        <th>Inventory Count</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in store.menu" :key="item.id">
        <td><input v-model="item.name" /></td>
        <td><input v-model="item.description" /></td>
        <td><input v-model.number="item.priceUSD" type="number" step="0.25" min="0" /></td>
        <td><input v-model.number="item.stock" type="number" min="0" /></td>
        <td class="row-actions">
          <button class="primary" @click="updateItem(item)">Save</button>
          <button @click="deleteItem(item.id)">Delete</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.add-form {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr auto;
  gap: 0.5rem;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0dcd3;
  margin-bottom: 1.5rem;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.admin-table th, .admin-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.row-actions {
  display: flex;
  gap: 0.4rem;
}
</style>