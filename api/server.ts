import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { render } from '../dist/server/entry-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// List of static file extensions that should be served directly
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map', '.webp', '.avif'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || '/';
    
    // Skip static files - let Vercel serve them directly
    const ext = path.extname(url).toLowerCase();
    if (STATIC_EXTENSIONS.includes(ext)) {
      // Return 404 so Vercel can serve the static file
      return res.status(404).send('Not Found');
    }
    
    // Skip API routes
    if (url.startsWith('/api/')) {
      return res.status(404).send('Not Found');
    }
    
    // Read the built HTML template
    const templatePath = path.resolve(__dirname, '../dist/client/index.html');
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Render the React app
    const appHtml = await render(url);
    
    // Inject the rendered HTML into the template
    const html = template.replace(`<!--ssr-outlet-->`, appHtml);
    
    // Send the response
    res.status(200).setHeader('Content-Type', 'text/html').send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
