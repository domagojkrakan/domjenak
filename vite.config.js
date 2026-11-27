import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// U razvoju /api/* poslužuju iste funkcije koje rade na Vercelu.
const localApi = () => ({
  name: 'local-api',
  configureServer(server) {
    for (const name of ['rsvp', 'rooms', 'rides']) {
      server.middlewares.use(`/api/${name}`, async (req, res) => {
        req.url = req.originalUrl || req.url;
        const mod = await server.ssrLoadModule(`/api/${name}.js`);
        return mod.default(req, res);
      });
    }
  },
});

export default defineConfig({
  plugins: [react(), localApi()],
});
