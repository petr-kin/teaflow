import { Audio } from 'expo-av';

class SoundManager {
  private chimeSound: Audio.Sound | null = null;
  private ambientSound: Audio.Sound | null = null;

  async initialize() {
    try {
      // Load chime sound for alerts
      const chime = new Audio.Sound();
      await chime.loadAsync(require('../assets/chime.wav'));
      this.chimeSound = chime;

      // Load ambient zen sound for timer
      const ambient = new Audio.Sound();
      await ambient.loadAsync(require('../assets/zen_loop.wav'));
      await ambient.setIsLoopingAsync(true);
      await ambient.setVolumeAsync(0.3);
      this.ambientSound = ambient;
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  }

  async playChime() {
    try {
      if (this.chimeSound) {
        await this.chimeSound.replayAsync();
      }
    } catch (error) {
      console.log('Error playing chime:', error);
    }
  }

  async startAmbient() {
    try {
      if (this.ambientSound) {
        await this.ambientSound.playAsync();
      }
    } catch (error) {
      console.log('Error starting ambient sound:', error);
    }
  }

  async stopAmbient() {
    try {
      if (this.ambientSound) {
        await this.ambientSound.pauseAsync();
      }
    } catch (error) {
      console.log('Error stopping ambient sound:', error);
    }
  }

  async cleanup() {
    try {
      if (this.chimeSound) {
        await this.chimeSound.unloadAsync();
      }
      if (this.ambientSound) {
        await this.ambientSound.unloadAsync();
      }
    } catch (error) {
      console.log('Error cleaning up sounds:', error);
    }
  }
}

export const soundManager = new SoundManager();