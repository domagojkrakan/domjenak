import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// U razvoju /api/rsvp poslužuje ista funkcija koja radi na Vercelu.
const localApi = () => ({
  name: 'local-api',
  configureServer(server) {
    server.middlewares.use('/api/rsvp', async (req, res) => {
      const mod = await server.ssrLoadModule('/api/rsvp.js');
      return mod.default(req, res);
    });
  },
});

export default defineConfig({
  plugins: [react(), localApi()],
});
