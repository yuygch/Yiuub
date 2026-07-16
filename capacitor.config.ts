import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.filmcam.app',
  appName: 'FilmCam',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
}

export default config
