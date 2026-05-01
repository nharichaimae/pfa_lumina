import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'lumina',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;