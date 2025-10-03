# Hướng dẫn Quản trị VMware vCenter và ESXi

## 📋 Mục lục
1. [Tổng quan về VMware](#tổng-quan-về-vmware)
2. [Cài đặt và cấu hình ESXi](#cài-đặt-và-cấu-hình-esxi)
3. [Quản trị vCenter Server](#quản-trị-vcenter-server)
4. [Quản lý Virtual Machines](#quản-lý-virtual-machines)
5. [Quản lý tài nguyên và Storage](#quản-lý-tài-nguyên-và-storage)
6. [Networking và Security](#networking-và-security)
7. [Monitoring và Troubleshooting](#monitoring-và-troubleshooting)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng quan về VMware

### VMware ESXi là gì?
- **ESXi (Elastic Sky X Integrated)**: Hypervisor type-1 chạy trực tiếp trên hardware
- Cung cấp virtualization layer để chạy nhiều VM trên một server vật lý
- Lightweight, không cần OS host

### VMware vCenter Server là gì?
- **vCenter**: Centralized management platform cho VMware infrastructure
- Quản lý nhiều ESXi hosts từ một giao diện duy nhất
- Cung cấp advanced features như vMotion, DRS, HA

### Kiến trúc VMware
```
┌─────────────────────────────────────┐
│           vCenter Server            │
│     (Management & Orchestration)    │
└─────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐       ┌───▼───┐       ┌───▼───┐
│ ESXi  │       │ ESXi  │       │ ESXi  │
│ Host1 │       │ Host2 │       │ Host3 │
└───────┘       └───────┘       └───────┘
    │               │               │
┌───▼───┐       ┌───▼───┐       ┌───▼───┐
│  VM1  │       │  VM2  │       │  VM3  │
│  VM2  │       │  VM3  │       │  VM4  │
└───────┘       └───────┘       └───────┘
```

---

## 🚀 Cài đặt và cấu hình ESXi

### Yêu cầu hệ thống
- **CPU**: Intel VT-x hoặc AMD-V support
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB+)
- **Storage**: Tối thiểu 32GB (SSD khuyến nghị)
- **Network**: Gigabit Ethernet

### Cài đặt ESXi

#### Bước 1: Tạo bootable USB
```bash
# Sử dụng Rufus hoặc VMware USB Creator
# Download ESXi ISO từ VMware website
```

#### Bước 2: Boot và cài đặt
1. Boot từ USB/DVD
2. Chọn "Install ESXi"
3. Chấp nhận license agreement
4. Chọn disk để cài đặt
5. Thiết lập root password
6. Reboot sau khi cài đặt xong

#### Bước 3: Cấu hình ban đầu
```bash
# Truy cập ESXi qua web browser
https://<ESXi-IP-Address>

# Hoặc qua SSH (enable SSH trước)
ssh root@<ESXi-IP-Address>
```

### Cấu hình Network
```bash
# Xem network configuration
esxcli network ip interface ipv4 get

# Cấu hình static IP
esxcli network ip interface ipv4 set -i vmk0 -I 192.168.1.100 -N 255.255.255.0 -g 192.168.1.1

# Enable SSH
vim-cmd hostsvc/enable_ssh
vim-cmd hostsvc/start_ssh
```

---

## 🎛️ Quản trị vCenter Server

### Cài đặt vCenter Server

#### vCenter Server Appliance (VCSA)
1. **Download VCSA ISO**
2. **Deploy OVA template**
3. **Cấu hình thông qua web interface**

#### Các bước cài đặt chi tiết:
```bash
# 1. Mount VCSA ISO
# 2. Chạy installer
# 3. Chọn "Install"
# 4. Nhập thông tin ESXi host
# 5. Cấu hình VM settings
# 6. Thiết lập network
# 7. Hoàn thành deployment
```

### Truy cập vCenter
- **Web Client**: `https://<vCenter-IP>/vsphere-client`
- **HTML5 Client**: `https://<vCenter-IP>/ui`

### Quản lý ESXi Hosts
```bash
# Thêm ESXi host vào vCenter
# 1. Right-click datacenter
# 2. Add Host
# 3. Nhập IP/hostname của ESXi
# 4. Nhập credentials
# 5. Review settings và finish
```

---

## 💻 Quản lý Virtual Machines

### Tạo Virtual Machine

#### Qua vCenter Web Client:
1. **Right-click ESXi host** → New Virtual Machine
2. **Chọn creation type**:
   - Create a new virtual machine
   - Deploy from template
   - Clone existing VM
3. **Cấu hình VM**:
   - Name và location
   - Compute resource
   - Storage
   - Compatibility
   - Guest OS
4. **Hardware settings**:
   - CPU: Sockets, cores
   - Memory: RAM allocation
   - Storage: Disk size, type
   - Network: Adapter type
5. **Ready to complete**

#### Qua ESXi Host Client:
```bash
# Truy cập ESXi host trực tiếp
https://<ESXi-IP>

# Tạo VM tương tự như vCenter
```

### VM Templates
```bash
# Tạo template từ VM
# 1. Power off VM
# 2. Right-click VM → Clone to Template
# 3. Đặt tên template
# 4. Chọn datastore
```

### Snapshots
```bash
# Tạo snapshot
# 1. Right-click VM → Snapshots → Take Snapshot
# 2. Đặt tên và mô tả
# 3. Include memory state (optional)

# Quản lý snapshots
# - View snapshots
# - Revert to snapshot
# - Delete snapshot
```

---

## 💾 Quản lý tài nguyên và Storage

### Datastores
```bash
# Xem datastores
esxcli storage vmfs extent list

# Tạo datastore mới
# 1. Storage → Datastores → New Datastore
# 2. Chọn type (VMFS, NFS, vSAN)
# 3. Cấu hình settings
```

### Resource Pools
```bash
# Tạo Resource Pool
# 1. Right-click cluster/host
# 2. New Resource Pool
# 3. Cấu hình CPU/Memory limits
# 4. Set shares và reservations
```

### vMotion
```bash
# Migrate VM (vMotion)
# 1. Right-click VM → Migrate
# 2. Chọn destination host
# 3. Chọn migration type:
#    - Change compute resource only
#    - Change storage only
#    - Change both compute resource and storage
```

---

## 🌐 Networking và Security

### Virtual Switches
```bash
# Xem virtual switches
esxcli network vswitch standard list

# Tạo virtual switch
esxcli network vswitch standard add --vswitch-name=vSwitch1

# Thêm port group
esxcli network vswitch standard portgroup add --portgroup-name=VM Network --vswitch-name=vSwitch1
```

### Firewall Rules
```bash
# Xem firewall rules
esxcli network firewall ruleset list

# Enable/disable ruleset
esxcli network firewall ruleset set --ruleset-id=sshServer --enabled=true
```

### SSL Certificates
```bash
# Renew SSL certificate
# 1. Administration → Certificate Management
# 2. Select certificate
# 3. Renew Certificate
```

---

## 📊 Monitoring và Troubleshooting

### Performance Monitoring
```bash
# Xem performance metrics
# 1. Monitor → Performance
# 2. Chọn object (Host, VM, Datastore)
# 3. Chọn metric và time range
```

### Log Files
```bash
# ESXi logs
/var/log/vmware/

# vCenter logs
# Windows: C:\ProgramData\VMware\vCenterServer\logs\
# Linux: /var/log/vmware/vpxd/
```

### Common Issues và Solutions

#### VM không start được:
```bash
# 1. Check VM logs
# 2. Verify resources available
# 3. Check storage connectivity
# 4. Verify network configuration
```

#### ESXi host không accessible:
```bash
# 1. Check network connectivity
# 2. Verify management network
# 3. Check firewall settings
# 4. Restart management agents
```

#### Performance issues:
```bash
# 1. Check resource utilization
# 2. Review resource pools
# 3. Check for resource contention
# 4. Optimize VM settings
```

---

## ✅ Best Practices

### Security
- **Thay đổi default passwords**
- **Enable lockdown mode**
- **Regular security updates**
- **Network segmentation**
- **SSL certificate management**

### Performance
- **Right-size VMs**
- **Use resource pools**
- **Monitor performance regularly**
- **Optimize storage**
- **Use VMFS-6 for new datastores**

### Backup và Recovery
- **Regular VM backups**
- **Test restore procedures**
- **Document recovery processes**
- **Use VMware Data Protection**

### Maintenance
- **Regular updates**
- **Health checks**
- **Capacity planning**
- **Documentation**
- **Change management**

---

## 🛠️ Các lệnh hữu ích

### ESXi Commands
```bash
# System information
esxcli system version get
esxcli hardware platform get

# Network commands
esxcli network ip interface list
esxcli network vswitch standard list

# Storage commands
esxcli storage vmfs extent list
esxcli storage core device list

# VM management
vim-cmd vmsvc/getallvms
vim-cmd vmsvc/power.on <vmid>
vim-cmd vmsvc/power.off <vmid>
```

### vCenter Commands (PowerCLI)
```powershell
# Connect to vCenter
Connect-VIServer -Server <vCenter-IP> -User <username> -Password <password>

# Get VMs
Get-VM

# Get ESXi hosts
Get-VMHost

# Create VM
New-VM -Name "TestVM" -VMHost <host> -Template <template>
```

---

## 📚 Tài liệu tham khảo

- [VMware vSphere Documentation](https://docs.vmware.com/en/VMware-vSphere/)
- [VMware Knowledge Base](https://kb.vmware.com/)
- [VMware Communities](https://communities.vmware.com/)
- [VMware Hands-on Labs](https://labs.hol.vmware.com/)

---

## 🎯 Kết luận

Quản trị VMware vCenter và ESXi là kỹ năng quan trọng cho các vị trí DevOps, System Administrator, và cả Mobile App Developer khi cần deploy và quản lý infrastructure. 

**Các bước tiếp theo:**
1. Thực hành trên lab environment
2. Học thêm về automation (PowerCLI, vRO)
3. Tìm hiểu về containerization (vSphere with Tanzu)
4. Chuẩn bị cho các certification như VCP

Chúc bạn học tập hiệu quả! 🚀
