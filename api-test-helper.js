/**
 * EAPLS API Test Helper
 * Sử dụng file này để test API dễ dàng hơn
 * 
 * Cách sử dụng:
 * 1. Chạy: node api-test-helper.js
 * 2. Token sẽ được lưu và tự động sử dụng cho các request tiếp theo
 */

const BASE_URL = 'https://api.eapls.io.vn';

// Credentials for Farm Supervisor
const CREDENTIALS = {
  identifier: "farmsupervisor@eapls.com",
  password: "Abc@1234"
};

let accessToken = null;
let refreshToken = null;

/**
 * Login và lấy token
 */
async function login() {
  try {
    console.log('🔐 Đang đăng nhập với ROLE Supervisor...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(CREDENTIALS)
    });

    const data = await response.json();
    
    if (response.ok && data.data) {
      accessToken = data.data.accessToken;
      refreshToken = data.data.refreshToken;
      
      console.log('✅ Đăng nhập thành công!');
      console.log('📋 Access Token:', accessToken?.substring(0, 50) + '...');
      console.log('🔄 Refresh Token:', refreshToken?.substring(0, 50) + '...');
      
      return { accessToken, refreshToken };
    } else {
      console.error('❌ Đăng nhập thất bại:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error.message);
    return null;
  }
}

/**
 * Lấy thông tin user hiện tại
 */
async function getCurrentUser() {
  try {
    console.log('\n👤 Đang lấy thông tin user...');
    
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Thông tin user:', JSON.stringify(data.data, null, 2));
      return data.data;
    } else {
      console.error('❌ Lấy thông tin user thất bại:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin user:', error.message);
    return null;
  }
}

/**
 * Test API endpoint bất kỳ
 */
async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}...`);
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Response:', JSON.stringify(data, null, 2));
      return data;
    } else {
      console.error('❌ Request failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Lấy danh sách Production Plans
 */
async function getProductionPlans(pageIndex = 1, pageSize = 10) {
  const endpoint = `/api/cultivation-logbooks?PageIndex=${pageIndex}&PageSize=${pageSize}`;
  return testEndpoint(endpoint);
}

/**
 * Lấy danh sách Tasks
 */
async function getTasks(pageIndex = 1, pageSize = 10) {
  const endpoint = `/api/cultivation-tasks?PageIndex=${pageIndex}&PageSize=${pageSize}`;
  return testEndpoint(endpoint);
}

/**
 * Lấy danh sách Crops
 */
async function getCrops(pageIndex = 1, pageSize = 10) {
  const endpoint = `/api/crops?PageIndex=${pageIndex}&PageSize=${pageSize}`;
  return testEndpoint(endpoint);
}

/**
 * Lấy danh sách Land Plots
 */
async function getLandPlots(pageIndex = 1, pageSize = 10) {
  const endpoint = `/api/land-plots?PageIndex=${pageIndex}&PageSize=${pageSize}`;
  return testEndpoint(endpoint);
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 EAPLS API Test Helper\n');
  console.log('═══════════════════════════════════════\n');
  
  // 1. Login
  const tokens = await login();
  if (!tokens) {
    console.log('\n❌ Không thể đăng nhập. Dừng test.');
    return;
  }

  // 2. Get current user info
  await getCurrentUser();

  // 3. Test các endpoint phổ biến
  console.log('\n═══════════════════════════════════════');
  console.log('📋 Testing common endpoints...\n');
  
  await getProductionPlans(1, 5);
  await getTasks(1, 5);
  await getCrops(1, 5);
  await getLandPlots(1, 5);

  console.log('\n═══════════════════════════════════════');
  console.log('✨ Test completed!\n');
  console.log('💡 Bạn có thể sử dụng các function sau để test:');
  console.log('   - testEndpoint(endpoint, method, body)');
  console.log('   - getProductionPlans(pageIndex, pageSize)');
  console.log('   - getTasks(pageIndex, pageSize)');
  console.log('   - getCrops(pageIndex, pageSize)');
  console.log('   - getLandPlots(pageIndex, pageSize)');
  console.log('\n📝 Access Token đã được lưu vào biến: accessToken');
}

// Export functions để có thể import vào file khác
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    login,
    getCurrentUser,
    testEndpoint,
    getProductionPlans,
    getTasks,
    getCrops,
    getLandPlots,
    BASE_URL,
    get accessToken() { return accessToken; },
    get refreshToken() { return refreshToken; }
  };
}

// Chạy main nếu file được execute trực tiếp
if (require.main === module) {
  main();
}
