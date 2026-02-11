// Image upload handler for Vercel serverless function
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.image?.[0] || files.image;
    
    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Read the file
    const fileData = fs.readFileSync(file.filepath);
    const base64Image = fileData.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';

    // Return base64 data URL
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      success: true,
      imageUrl: dataUrl,
      size: file.size,
      type: mimeType,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
}
