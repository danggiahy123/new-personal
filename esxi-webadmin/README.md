# ESXi Web Admin Dashboard

A modern React-based web administration dashboard for managing VMware ESXi virtual machines.

## Features

- 🔐 **Secure Authentication**: Login with ESXi credentials
- 🖥️ **VM Management**: Start, stop, restart, and suspend virtual machines
- 📊 **Real-time Dashboard**: Live statistics and resource monitoring
- 🎨 **Modern UI**: Clean, responsive design inspired by vSphere
- ⚡ **Real-time Updates**: Auto-refresh VM status every 30 seconds
- 🔄 **Bulk Operations**: Select and manage multiple VMs at once
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Prerequisites

- Node.js 16+ and npm
- Backend API server running (Node.js + Express)
- VMware ESXi host accessible via network

## Installation

1. **Clone or download the project**
   ```bash
   cd esxi-webadmin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Backend API Requirements

Your backend should provide these endpoints:

### Authentication
- `POST /api/login` - Login with ESXi credentials
- `POST /api/logout` - Logout and clear session

### VM Management
- `GET /api/vms` - Get list of virtual machines
- `POST /api/vms/:id/start` - Start a virtual machine
- `POST /api/vms/:id/stop` - Stop a virtual machine
- `POST /api/vms/:id/restart` - Restart a virtual machine
- `POST /api/vms/:id/suspend` - Suspend a virtual machine

### Expected VM Data Format
```json
{
  "success": true,
  "data": [
    {
      "id": "vm-123",
      "name": "Ubuntu Server",
      "power_state": "powered_on",
      "cpu": 2,
      "memory_size": 4294967296
    }
  ]
}
```

## Project Structure

```
esxi-webadmin/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.js      # Main dashboard component
│   │   ├── Header.js         # Top navigation header
│   │   ├── Layout.js         # Main layout wrapper
│   │   ├── LoginForm.js      # Login form component
│   │   ├── Sidebar.js        # Left navigation sidebar
│   │   └── VMTable.js        # Virtual machines table
│   ├── contexts/
│   │   └── AuthContext.js    # Authentication context
│   ├── services/
│   │   ├── authService.js    # Authentication API calls
│   │   └── vmService.js      # VM management API calls
│   ├── App.js                # Main app component
│   ├── index.js              # App entry point
│   └── index.css             # Global styles
├── package.json
├── tailwind.config.js
└── README.md
```

## Components Overview

### LoginForm
- Secure login with username/password
- Form validation and error handling
- Loading states and user feedback
- Responsive design

### Dashboard
- Overview statistics (total VMs, running, stopped, suspended)
- Resource usage charts (CPU, Memory)
- Recent activity feed
- Quick access to VM management

### VMTable
- Complete VM listing with status indicators
- Individual VM actions (start, stop, restart, suspend)
- Bulk operations for multiple VMs
- Real-time status updates
- Responsive table design

### Layout & Navigation
- VMware-inspired sidebar navigation
- Top header with user info and logout
- Responsive layout for all screen sizes
- Status indicators for ESXi connection

## Styling & Design

The application uses:
- **Tailwind CSS** for utility-first styling
- **Custom VMware color palette** inspired by vSphere
- **Lucide React** for consistent iconography
- **Responsive design** for all device sizes
- **Dark/light theme support** (VMware colors)

## State Management

- **React Context** for authentication state
- **React Query** for server state management
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

## Security Features

- Session-based authentication
- Automatic session validation
- Secure credential handling
- CSRF protection via session tokens
- Auto-logout on session expiry

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_NAME` - Application name
- `REACT_APP_VERSION` - Application version
- `REACT_APP_DEBUG` - Enable debug mode
- `REACT_APP_LOG_LEVEL` - Logging level

## Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder**
   - Upload to your web server
   - Configure reverse proxy if needed
   - Ensure HTTPS for production use

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `REACT_APP_API_URL` in `.env`
   - Verify backend server is running
   - Check network connectivity

2. **Authentication Issues**
   - Verify ESXi credentials
   - Check backend authentication endpoint
   - Clear browser localStorage

3. **VM Actions Not Working**
   - Check ESXi API permissions
   - Verify VM IDs are correct
   - Check backend error logs

### Debug Mode

Enable debug mode in `.env`:
```env
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review backend API documentation
- Check browser console for errors
- Verify network connectivity

---

**Note**: This frontend requires a compatible backend API server. Make sure your backend implements the required endpoints and data formats as specified in this documentation.
