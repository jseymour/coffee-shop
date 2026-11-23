<script setup lang="ts">
const store = useShopStore()

await useAsyncData('menu', () => store.fetchMenu())

onMounted(() => {
  if (!store.currentCustomer) {
    store.nextCustomer()
  }
})
</script>

<template>
  <div>
    <!-- Active Customer Banner -->
    <section v-if="store.currentCustomer" class="customer-card">
      <div>
        <h2>Customer #{{ store.currentCustomer.id }} at the Counter</h2>
        <p class="budget">
          Starting Budget:
          <strong>{{ store.currentCustomer.currency.symbol }}{{ store.currentCustomer.budget }} ({{ store.currentCustomer.currency.code }})</strong>
          | Remaining:
          <strong>{{ store.currentCustomer.currency.symbol }}{{ store.remainingBudget }}</strong>
        </p>
      </div>
      <button @click="store.leaveWithoutBuying()">Leave Without Buying</button>
    </section>

    <p v-if="store.statusMessage" class="notice">{{ store.statusMessage }}</p>

    <div class="grid">
      <!-- Coffee Menu -->
      <section class="menu-section">
        <h3>Coffee Menu</h3>
        <div v-for="item in store.localizedMenu" :key="item.id" class="menu-item">
          <div>
            <h4>
              {{ item.name }}
              <span class="price">
                {{ store.currentCustomer?.currency.symbol }}{{ item.localPrice }}
              </span>
            </h4>
            <p class="desc">{{ item.description }}</p>
            <small :class="{ 'out-of-stock': item.stock === 0 }">
              {{ item.stock > 0 ? `${item.stock} available` : 'Sold Out' }}
            </small>
          </div>

          <div class="actions">
            <button
                class="primary"
                :disabled="
                item.stock === 0 ||
                (store.cart[item.id] || 0) >= item.stock ||
                item.localPrice > store.remainingBudget
              "
                @click="store.addToCart(item.id)"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <!-- Customer Tray / Cart -->
      <aside class="cart-section">
        <h3>Current Order</h3>
        <div v-if="Object.keys(store.cart).length === 0" class="empty">
          No items selected yet.
        </div>
        <ul v-else class="cart-list">
          <li v-for="(qty, id) in store.cart" :key="id">
            <span>
              {{ store.localizedMenu.find(i => i.id === id)?.name }} x {{ qty }}
            </span>
            <button @click="store.removeFromCart(String(id))">-</button>
          </li>
        </ul>

        <div v-if="Object.keys(store.cart).length > 0" class="checkout-box">
          <p>
            Total:
            <strong>{{ store.currentCustomer?.currency.symbol }}{{ store.cartTotal }}</strong>
          </p>
          <button class="primary full-width" @click="store.checkout()">
            Complete Purchase
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.customer-card {
  background: #fff;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #e0dcd3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.customer-card h2 { margin: 0 0 0.25rem; font-size: 1.2rem; }
.budget { margin: 0; color: #444; }
.notice {
  background: #efe9dc;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
}
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.menu-item, .cart-section {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0dcd3;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.menu-item h4 { margin: 0 0 0.25rem; }
.price { color: #2c1e16; margin-left: 0.5rem; }
.desc { margin: 0 0 0.4rem; color: #666; font-size: 0.9rem; }
.out-of-stock { color: #b91c1c; font-weight: 700; }
.cart-list { list-style: none; padding: 0; margin: 0 0 1rem; }
.cart-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
}
.full-width { width: 100%; }
</style>