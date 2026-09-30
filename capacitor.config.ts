import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.github.malkbaty7_sketch.katib',
  appName: 'كاتب',
  webDir: 'dist',
  backgroundColor: '#1c1917',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
