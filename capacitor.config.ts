import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futbolrapidotribol.admin',
  appName: 'Futbol Rapido Tribol Admin',
  webDir: 'dist',
  server: {
    url: 'https://tribolv2.vercel.app/',
    cleartext: true
  }
};

export default config;
