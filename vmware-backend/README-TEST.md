# 🧪 ESXi API Testing Guide

Hướng dẫn test trực tiếp API của VMware ESXi host.

## 📋 Yêu cầu

- Node.js đã cài đặt
- ESXi host đang chạy và có thể truy cập
- Thông tin đăng nhập ESXi (username/password)

## 🚀 Cách sử dụng

### Bước 1: Cấu hình thông tin ESXi

1. Mở file `test-config-local.js`
2. Thay đổi thông tin ESXi của bạn:

```javascript
module.exports = {
  esxi: {
    host: 'https://192.168.159.128', // IP ESXi của bạn
    username: 'root', // Username ESXi
    password: 'your-password-here' // Password ESXi
  },
  // ...
};
```

### Bước 2: Cài đặt dependencies

```bash
cd vmware-backend
npm install axios
```

### Bước 3: Chạy test

#### Option 1: Test đơn giản (Khuyến nghị)
```bash
node test-esxi-simple.js
```

#### Option 2: Test chi tiết
```bash
node test-esxi-api.js
```

## 📊 Các test được thực hiện

### 1. Authentication Test
- ✅ Login vào ESXi host
- ✅ Lấy session ID
- ✅ Logout

### 2. VM Management Test
- ✅ Lấy danh sách VMs
- ✅ Lấy thông tin chi tiết VM
- ✅ Test VM power operations (start/stop/restart)

### 3. Host Information Test
- ✅ Lấy thông tin host
- ✅ Kiểm tra connection state

## 🔧 Cấu hình test

Trong file `test-config-local.js`, bạn có thể tùy chỉnh:

```javascript
test: {
  timeout: 15000, // Timeout cho mỗi request (ms)
  skipPowerOperations: true, // Bỏ qua test power operations (an toàn)
  testSpecificVM: null // ID của VM cụ thể để test
}
```

## ⚠️ Lưu ý quan trọng

1. **SSL Certificate**: Test tự động bypass SSL self-signed certificate
2. **Power Operations**: Mặc định bỏ qua để tránh thay đổi trạng thái VM
3. **Credentials**: Đảm bảo username/password chính xác
4. **Network**: Đảm bảo ESXi host có thể truy cập từ máy test

## 🐛 Troubleshooting

### Lỗi kết nối
```
❌ Login failed: ECONNREFUSED
```
**Giải pháp**: Kiểm tra IP ESXi và đảm bảo host đang chạy

### Lỗi authentication
```
❌ Login failed: 401 Unauthorized
```
**Giải pháp**: Kiểm tra username/password ESXi

### Lỗi SSL
```
❌ Login failed: certificate verify failed
```
**Giải pháp**: Test đã được cấu hình bypass SSL, kiểm tra network

### Lỗi timeout
```
❌ Login failed: timeout
```
**Giải pháp**: Tăng timeout trong config hoặc kiểm tra network

## 📝 Output mẫu

```
🚀 Starting Simple ESXi API Tests
==================================
Host: https://192.168.159.128
User: root

🔐 Logging in to ESXi...
✅ Login successful!

🖥️  Getting VMs...
✅ Found 2 VMs:
  1. Ubuntu-Server (POWERED_ON)
  2. Windows-10 (POWERED_OFF)

🔍 Getting details for VM: vm-123...
✅ VM Details:
  Name: Ubuntu-Server
  Power: POWERED_ON
  CPU: 2 cores
  Memory: 4096 MB

⚡ Testing start for VM: vm-123...
⚠️  Power operations skipped for safety
   Would call: POST /rest/vcenter/vm/vm-123/power/start

🖥️  Getting host info...
✅ Found 1 hosts:
  1. localhost.localdomain (CONNECTED)

🚪 Logging out...
✅ Logout successful

🎉 All tests completed successfully!
```

## 🔗 API Endpoints được test

- `POST /rest/com/vmware/cis/session` - Login
- `GET /rest/vcenter/vm` - Lấy danh sách VMs
- `GET /rest/vcenter/vm/{id}` - Lấy thông tin VM
- `GET /rest/vcenter/host` - Lấy thông tin host
- `POST /rest/vcenter/vm/{id}/power/start` - Start VM
- `POST /rest/vcenter/vm/{id}/power/stop` - Stop VM
- `POST /rest/vcenter/vm/{id}/power/restart` - Restart VM
- `DELETE /rest/com/vmware/cis/session` - Logout

## 🎯 Sử dụng trong code

Bạn có thể import và sử dụng tester trong code của mình:

```javascript
const SimpleESXiTester = require('./test-esxi-simple');

async function testMyESXi() {
  const tester = new SimpleESXiTester();
  await tester.runTests();
}
```
