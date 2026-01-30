# FFmpeg Setup Guide

The video processing service requires FFmpeg to be installed on your system.

## Installation

### Windows

1. **Download FFmpeg:**
   - Visit https://www.gyan.dev/ffmpeg/builds/
   - Download the "ffmpeg-release-essentials.zip"

2. **Extract and Install:**
   - Extract the ZIP file to `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to your system PATH

3. **Verify Installation:**
   ```cmd
   ffmpeg -version
   ```

### macOS

Using Homebrew:
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

### Docker

If running in Docker, add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

## Verification

After installation, verify FFmpeg is available:

```bash
ffmpeg -version
ffprobe -version
```

You should see version information for both commands.

## Troubleshooting

### "ffmpeg: command not found"

- Ensure FFmpeg is installed
- Verify the installation directory is in your PATH
- Restart your terminal/IDE after installation

### Permission Issues

On Linux/macOS, you may need to make FFmpeg executable:
```bash
chmod +x /path/to/ffmpeg
```

## Configuration

The video processor uses FFmpeg to:
- Extract thumbnails at 2-second mark
- Transcode videos to 480p, 720p, and 1080p
- Generate HLS manifests and segments
- Validate video duration (max 60 seconds)

No additional FFmpeg configuration is required for basic operation.
