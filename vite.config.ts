import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';

function resolveAppVersion(): string {
  const ref = process.env.GITHUB_REF_NAME;
  if (ref && /^v\d+\.\d+\.\d+/.test(ref)) {
    return ref.replace(/^v/, '');
  }
  try {
    return execSync('git describe --tags --always --dirty', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
      .replace(/^v/, '');
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(resolveAppVersion()),
  },
});
