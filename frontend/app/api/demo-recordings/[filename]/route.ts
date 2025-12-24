import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const RECORDINGS_PATH = path.join(process.cwd(), '../ai-demo-call/recordings/videos');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const videoPath = path.join(RECORDINGS_PATH, filename);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Read video file
    const videoBuffer = fs.readFileSync(videoPath);
    const stat = fs.statSync(videoPath);

    // Check if download is requested
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    // Create response with video
    const response = new NextResponse(videoBuffer);
    
    response.headers.set('Content-Type', 'video/mp4');
    response.headers.set('Content-Length', stat.size.toString());
    
    if (download) {
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      response.headers.set('Content-Disposition', `inline; filename="${filename}"`);
    }

    return response;
  } catch (error: any) {
    console.error('Error serving video:', error);
    return NextResponse.json(
      { error: 'Failed to serve video' },
      { status: 500 }
    );
  }
}
