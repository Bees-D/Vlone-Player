# Important Project Information

## 🔗 Key Repositories
- **Main Project**: [Bees-D/Vlone-Player](https://github.com/Bees-D/Vlone-Player)
- **Asset Storage**: [Bees-D/Vlone-Storage](https://github.com/Bees-D/Vlone-Storage) (Reserved for persistent uploads/user content)

## 📡 API Reference
- **Documentation**: [juicewrldapi.com/api-docs](https://juicewrldapi.com/api-docs)
- **Base URL**: `https://juicewrldapi.com`
- **Key Endpoints**:
  - Songs: `/songs/` (Supports filtering by `category`, `era`, `search`, `lyrics`, `searchall`)
  - File Browser: `/files/browse/?path=`
  - Cover Art: `/files/cover-art/?path=`
  - Streaming: `/files/download/?path=`

## 🔑 Environment Variables
- `VITE_API_PAT`: Your GitHub Personal Access Token (Required ONLY for Vlone-Storage interactions, not public API reading).

## 🚀 Deployment verified
- **Vercel**: `vlone-player.vercel.app` (Requires manual push to update)
- **Cloudflare Pages**: Compatible (uses `dist` output)
