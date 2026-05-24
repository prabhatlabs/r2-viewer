# R2 Viewer

A modern web application for browsing and managing files stored in Cloudflare R2 (S3-compatible) storage buckets. Built with Next.js, React, and TypeScript.

## 🚀 Features

- **File Browser**: Navigate folders and view files in grid or list view
- **File Operations**: Upload, download, delete, and copy file links
- **Preview Support**: View images, videos, PDFs, and text files directly in the browser
- **Search**: Search files and folders by name
- **History Navigation**: Back/forward navigation like a traditional file explorer
- **Multiple Views**: Grid and list view options
- **Secure Credential Storage**: Credentials stored locally in browser (not sent to server)
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Automatic theme detection with manual override

## 🛠️ Technology Stack

- **Framework**: Next.js 16.2.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.3.0
- **UI Components**: Base UI + custom components
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Storage**: Cloudflare R2 (via AWS S3 SDK)
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Cloudflare R2 bucket with appropriate credentials
- Access to your R2 bucket (Account ID, Access Key ID, Secret Access Key, Bucket Name)

## 🔧 Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd r2-viewer
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Configure credentials (optional)**
You have two options for providing your R2 credentials:

**Option A: Through the UI (Recommended)**
- Simply start the application and click the gear icon in the header to open Settings
- Enter your credentials there - they will be securely stored in your browser's localStorage

**Option B: Environment variables**
Create a `.env` file in the root directory with your R2 credentials:
```env
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_BASE_URL=your-public-domain-or-empty
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
CF_ACCOUNT_ID=your-cloudflare-account-id
```

> 💡 **Note**: Credentials entered via the UI take precedence over environment variables. If you prefer not to commit credentials to your repository, using the UI is the recommended approach.

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

To start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
# or
bun start
```

## 📂 How It Works

### Architecture Overview

R2 Viewer consists of:

1. **Frontend (Next.js App)**:
   - React components for UI rendering
   - Zustand stores for state management
   - Custom hooks for data fetching and manipulation
   - API routes for communicating with R2

2. **Backend API Routes**:
   - `/api/storage`: Handles all R2 operations (list, upload, delete)
   - `/api/settings`: Handles user credential storage (client-side only)

### Data Flow

1. **Authentication**: Credentials are entered via Settings dialog and stored in browser localStorage (never sent to server)
2. **API Requests**: Frontend makes requests to Next.js API routes
3. **API Routes**: Extract credentials from request headers and use AWS S3 SDK to interact with R2
4. **Presigned URLs**: For secure file access, the API generates presigned URLs for downloads and uploads
5. **Caching**: File listings are cached locally for 5 minutes to improve performance

### Key Components

- **`app/page.tsx`**: Main application container
- **`components/app-sidebar.tsx`**: Folder navigation sidebar
- **`components/file-explorer.tsx`**: Main file display area
- **`components/file-detail.tsx`**: File preview pane
- **`components/header.tsx`**: Upload, search, view mode controls
- **`components/top-nav.tsx`**: Breadcrumb navigation
- **`lib/api.ts`**: Axios instance with credential injection
- **`lib/store-storage.ts`**: Zustand store for file data and caching
- **`app/api/storage/route.js`**: Backend API for R2 operations

## 🔐 Security Notes

- **Credentials**: Your R2 credentials are stored only in your browser's localStorage and are never transmitted to any external server
- **API Security**: All R2 operations are proxied through your own Next.js application, preventing direct exposure of credentials
- **Presigned URLs**: Generated URLs expire after 1 hour (downloads) or 5 minutes (uploads) for security
- **No Tracking**: The application doesn't collect any analytics or usage data

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**
   - Verify your R2 credentials are correct
   - Check that your bucket name and region are properly configured
   - Ensure your access keys have List, Get, Put, and Delete permissions

2. **CORS errors**
   - R2 Viewer doesn't require special CORS configuration as it proxies through your Next.js app
   - If you're accessing the app from a different domain, ensure your Next.js app is properly configured

3. **File preview not working**
   - Some file types may not be supported by browsers for direct preview
   - Try downloading the file to view it locally

### Debugging

Enable debug logging by setting `localStorage.debug = 'r2-viewer:*'` in your browser console.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org) - The React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Base UI](https://baseui.com) - UI component library
- [Zustand](https://zustand-demo.pmndrs.org) - State management
- [Lucide](https://lucide.dev) - Beautiful icons
- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/) - R2/S3 integration

---

Built with ❤️ for easy R2 bucket management.
