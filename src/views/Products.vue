<!-- Change BACK to original names in Products.vue: -->
<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useProducts } from '@/composables/useProducts';
import { useAuth0 } from '@auth0/auth0-vue';

const { products, loading, error, fetchProducts } = useProducts(); // ← Use original names
const { isAuthenticated } = useAuth0();

onMounted(() => {
  fetchProducts();
});

watch(isAuthenticated, () => {
  fetchProducts(true);
});

const formatPrice = (p?: number | null) =>
  p === undefined || p === null ? '—' : `£${(p / 100).toFixed(2)}`;
</script>

<template>
  <div class="products-view">
    <h1>Devices</h1> <!-- You can keep title as "Devices" -->

    <div v-if="loading" class="loading">Loading Devices</div>
    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchProducts(true)">Retry</button>
    </div>
    <div v-else-if="products.length === 0" class="empty"> <!-- products, not devices -->
      No devices found.
    </div>

    <ul v-else class="list">
      <li v-for="p in products" :key="p.id" class="card"> <!-- products, not devices -->
        <div class="row">
          <strong class="name">{{ p.name }}</strong>
          <span class="price">{{ formatPrice(p.pricePence) }}</span>
        </div>
        <p v-if="p.description" class="desc">{{ p.description }}</p>
      </li>
    </ul>
  </div>
</template>