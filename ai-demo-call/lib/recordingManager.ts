/**
 * Recording Manager - Download and save demo videos
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

export class RecordingManager {
  private dailyApiKey: string;
  private savePath: string;

  constructor(dailyApiKey: string, savePath?: string) {
    this.dailyApiKey = dailyApiKey;
    this.savePath = savePath || path.join(__dirname, '../recordings/videos');
    
    // Ensure save directory exists
    if (!fs.existsSync(this.savePath)) {
      fs.mkdirSync(this.savePath, { recursive: true });
    }
  }

  /**
   * Wait for recording to be ready
   */
  async waitForRecording(recordingId: string, maxWaitSeconds: number = 120): Promise<any> {
    const startTime = Date.now();
    const pollInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const recording = await this.getRecordingStatus(recordingId);
      
      console.log(`📊 Recording status: ${recording.status}`);

      if (recording.status === 'finished') {
        return recording;
      }

      if (recording.status === 'error') {
        throw new Error('Recording failed');
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Recording timeout - took too long to process');
  }

  /**
   * Get recording status from Daily.co
   */
  private async getRecordingStatus(recordingId: string): Promise<any> {
    const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get recording status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download recording from Daily.co
   */
  async downloadRecording(recordingId: string, filename?: string): Promise<string> {
    console.log('📥 Downloading recording...');

    // Get recording details
    const recording = await this.getRecordingStatus(recordingId);

    if (!recording.download_link) {
      throw new Error('Recording download link not available');
    }

    // Generate filename
    const videoFilename = filename || `demo-${Date.now()}.mp4`;
    const videoPath = path.join(this.savePath, videoFilename);

    // Download file
    await this.downloadFile(recording.download_link, videoPath);

    console.log(`✅ Recording saved: ${videoPath}`);
    
    // Save metadata
    await this.saveMetadata(recordingId, videoFilename, recording);

    return videoPath;
  }

  /**
   * Download file from URL
   */
  private downloadFile(url: string, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destination);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r📥 Downloading: ${progress}%`);
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('\n✅ Download complete');
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete partial file
        reject(err);
      });
    });
  }

  /**
   * Save recording metadata
   */
  private async saveMetadata(recordingId: string, filename: string, recording: any): Promise<void> {
    const metadata = {
      recordingId,
      filename,
      duration: recording.duration,
      startTime: recording.start_ts,
      endTime: recording.end_ts,
      downloadedAt: new Date().toISOString(),
      downloadLink: recording.download_link,
      roomName: recording.room_name,
    };

    const metadataPath = path.join(this.savePath, `${filename}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * List all saved recordings
   */
  listRecordings(): Array<{ filename: string; metadata: any }> {
    const files = fs.readdirSync(this.savePath);
    const recordings: Array<{ filename: string; metadata: any }> = [];

    files.forEach(file => {
      if (file.endsWith('.mp4')) {
        const metadataFile = `${file}.json`;
        const metadataPath = path.join(this.savePath, metadataFile);
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          recordings.push({ filename: file, metadata });
        }
      }
    });

    return recordings;
  }

  /**
   * Get path to saved recording
   */
  getRecordingPath(filename: string): string {
    return path.join(this.savePath, filename);
  }
}
