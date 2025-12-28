import { ref, type Ref } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';

export type Product = {
  id: string;
  name: string;
  pricePence?: number;
  description?: string;
};

const API_BASE = appConfig.apiBaseUrl;
console.log('🔧 useProducts.ts - API_BASE loaded:', API_BASE);

export function useProducts() {
  console.log('🔧 useProducts() called');
  
  const { isAuthenticated, getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const products: Ref<Product[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const fetchProducts = async (force = false) => {
    console.log('📡 FETCH PRODUCTS - Starting...');
    console.log('   API_BASE:', API_BASE);
    console.log('   isAuthenticated:', isAuthenticated.value);
    
    if (loading.value) {
      console.log('   ⏸️ Already loading, skipping');
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const url = new URL('products', API_BASE).toString();
      console.log('   🎯 Target URL:', url);
      
      const headers: Record<string, string> = { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (isAuthenticated.value) {
        try {
          console.log('   🔐 Attempting to get access token...');
          const token = await getAccessTokenSilently();
          console.log('   ✅ Token received, length:', token.length);
          
          // Debug token content
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('   🔍 Token payload:', {
              aud: payload.aud,
              iss: payload.iss,
              scope: payload.scope || payload.permissions,
              exp: new Date(payload.exp * 1000).toISOString()
            });
          } catch (e) {
            console.log('   🔍 Could not decode token');
          }
          
          if (token) {
            headers.Authorization = `Bearer ${token}`;
            console.log('   ✅ Added Authorization header');
          }
        } catch (tokenError) {
          console.warn('   ⚠️ Token retrieval failed:', tokenError);
        }
      } else {
        console.log('   👤 Not authenticated, proceeding without token');
      }
      
      console.log('   📤 Request headers:', headers);
      console.log('   📡 Making fetch request...');
      
      const startTime = Date.now();
      const res = await fetch(url, { headers });
      const duration = Date.now() - startTime;
      
      console.log(`   ⏱️ Response received in ${duration}ms`);
      console.log('   📊 Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('   ❌ Response error:', errorText);
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      }
      
      const data: Product[] = await res.json();
      console.log(`   ✅ Success! Received ${data.length} products`);
      console.log('   📝 Sample product:', data[0]);
      
      products.value = Array.isArray(data) ? data : [];
      
    } catch (e) {
      console.error('   💥 Fetch error:', e);
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      console.log('📡 FETCH PRODUCTS - Completed');
      loading.value = false;
    }
  };

  return { products, loading, error, fetchProducts };
}
