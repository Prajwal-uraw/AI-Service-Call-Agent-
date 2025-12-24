import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const RECORDINGS_PATH = path.join(process.cwd(), '../ai-demo-call/recordings/videos');

export async function GET(request: NextRequest) {
  try {
    // Ensure recordings directory exists
    if (!fs.existsSync(RECORDINGS_PATH)) {
      return NextResponse.json({ recordings: [] });
    }

    // Read all files in recordings directory
    const files = fs.readdirSync(RECORDINGS_PATH);
    const recordings: Array<{ filename: string; metadata: any }> = [];

    files.forEach(file => {
      if (file.endsWith('.mp4')) {
        const metadataFile = `${file}.json`;
        const metadataPath = path.join(RECORDINGS_PATH, metadataFile);
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          recordings.push({ filename: file, metadata });
        }
      }
    });

    // Sort by download date (newest first)
    recordings.sort((a, b) => {
      return new Date(b.metadata.downloadedAt).getTime() - new Date(a.metadata.downloadedAt).getTime();
    });

    return NextResponse.json({ recordings });
  } catch (error: any) {
    console.error('Error loading recordings:', error);
    return NextResponse.json(
      { error: 'Failed to load recordings' },
      { status: 500 }
    );
  }
}
