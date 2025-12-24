'use client';

import { useState, useEffect } from 'react';
import { Play, Download, Calendar, Clock } from 'lucide-react';

interface Recording {
  filename: string;
  metadata: {
    recordingId: string;
    duration: number;
    downloadedAt: string;
    downloadLink: string;
    roomName: string;
  };
}

export default function DemoVideosPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const response = await fetch('/api/demo-recordings');
      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Demo Videos
          </h1>
          <p className="text-xl text-gray-300">
            View and download your generated demo recordings
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Loading recordings...</p>
          </div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No recordings yet.</p>
            <p className="text-gray-500 mt-2">Run the demo generator to create your first video!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              {selectedVideo ? (
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    key={selectedVideo.filename}
                    controls
                    className="w-full aspect-video"
                    src={`/api/demo-recordings/${selectedVideo.filename}`}
                  >
                    Your browser does not support video playback.
                  </video>
                  <div className="p-6 bg-gray-800">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedVideo.filename}
                    </h3>
                    <div className="flex items-center gap-6 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(selectedVideo.metadata.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedVideo.metadata.downloadedAt)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <a
                        href={selectedVideo.metadata.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Download from Daily.co
                      </a>
                      <a
                        href={`/api/demo-recordings/${selectedVideo.filename}?download=true`}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Download Local Copy
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-2xl p-20 text-center">
                  <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select a video to play</p>
                </div>
              )}
            </div>

            {/* Recording List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-6">All Recordings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordings.map((recording) => (
                  <button
                    key={recording.filename}
                    onClick={() => setSelectedVideo(recording)}
                    className={`p-6 rounded-xl transition-all text-left ${
                      selectedVideo?.filename === recording.filename
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Play className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {recording.filename}
                      </h3>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(recording.metadata.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(recording.metadata.downloadedAt)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
