import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  // basicSsl: 자체 서명 인증서로 https 제공 (카메라는 https에서만 허용됨)
  plugins: [react(), basicSsl()],
  server: { host: true },
  preview: { host: true },
});
