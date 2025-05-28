// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 클라이언트 개발 서버 포트 (기본값)
    proxy: {
      '/api': { // '/api'로 시작하는 모든 요청을 프록시
        target: 'http://localhost:3000', // ✨ 백엔드 서버 주소 (server 폴더의 포트)
        changeOrigin: true, // 호스트 헤더를 백엔드 URL로 변경
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 경로 제거
      },
    },
  },
});