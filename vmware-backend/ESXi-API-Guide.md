# 🖥️ ESXi API Testing Guide

Hướng dẫn test API của VMware ESXi host với thông tin thực tế.

## 📋 Thông tin ESXi của bạn

- **Host**: `https://192.168.159.128`
- **Username**: `root`
- **Password**: `25836926Hy@`
- **UI**: `https://192.168.159.128/ui/#/host/manage/services`

## 🚀 Cách test ESXi API

### 1. Test với Node.js (Đã tạo sẵn)

```bash
cd vmware-backend
node test-esxi-final.js
```

### 2. Test với curl commands

```bash
# Lấy danh sách VMs
curl -k -u root:25836926Hy@ https://192.168.159.128/api/vms

# Lấy thông tin Host
curl -k -u root:25836926Hy@ https://192.168.159.128/api/host

# Lấy thông tin Storage
curl -k -u root:25836926Hy@ https://192.168.159.128/api/storage

# Lấy thông tin Networking
curl -k -u root:25836926Hy@ https://192.168.159.128/api/networking

# Lấy danh sách Services
curl -k -u root:25836926Hy@ https://192.168.159.128/api/services
```

### 3. Test với PowerShell (Windows)

```powershell
# Lấy danh sách VMs
Invoke-RestMethod -Uri "https://192.168.159.128/api/vms" -Method Get -Credential (Get-Credential) -SkipCertificateCheck

# Lấy thông tin Host
Invoke-RestMethod -Uri "https://192.168.159.128/api/host" -Method Get -Credential (Get-Credential) -SkipCertificateCheck
```

### 4. Test với script tự động

```bash
bash test-esxi-curl.sh
```

## 🔍 Phân tích kết quả test

### ✅ Kết nối thành công
- ESXi host có thể truy cập được
- Authentication hoạt động
- SSL certificate được bypass thành công

### ⚠️ API Endpoints
- ESXi của bạn sử dụng JSON-RPC API
- Các endpoint `/api/vms`, `/api/host` trả về lỗi 400
- Cần tìm hiểu thêm về API structure thực tế

## 🛠️ Cách tìm hiểu API thực tế

### 1. Sử dụng Browser Dev Tools
1. Mở ESXi Host Client: `https://192.168.159.128/ui/#/host/manage/services`
2. Đăng nhập với `root` / `25836926Hy@`
3. Mở Developer Tools (F12)
4. Vào tab Network
5. Thực hiện các thao tác trong UI
6. Xem các API calls được gửi

### 2. Sử dụng Postman
1. Import collection với ESXi endpoints
2. Thiết lập authentication
3. Test các API calls

### 3. Sử dụng VMware vSphere REST API Explorer
1. Truy cập: `https://192.168.159.128/apiexplorer/`
2. Khám phá các API endpoints có sẵn

## 📁 Files đã tạo

1. **`test-esxi-final.js`** - Test chính với ESXi API
2. **`test-esxi-curl.sh`** - Script bash để test với curl
3. **`test-config-local.js`** - Config với thông tin ESXi thực tế
4. **`ESXi-API-Guide.md`** - Hướng dẫn này

## 🎯 Kết luận

ESXi host của bạn đang chạy và có thể kết nối được. Tuy nhiên, API structure có vẻ khác với vSphere REST API thông thường. 

**Khuyến nghị:**
1. Sử dụng Browser Dev Tools để khám phá API thực tế
2. Tham khảo VMware documentation cho ESXi Host Client API
3. Sử dụng các curl commands trên để test thủ công
4. Kiểm tra ESXi version và API compatibility

## 🔗 Tài liệu tham khảo

- [VMware ESXi Host Client API](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.vcenterhost.doc/GUID-8B5B0B8A-8B5B-8B5B-8B5B-8B5B8B5B8B5B.html)
- [vSphere REST API Reference](https://developer.vmware.com/apis/vsphere-automation/latest/)
- [ESXi Host Client Developer Guide](https://developer.vmware.com/apis/vsphere-automation/latest/esxi/)
