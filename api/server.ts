import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { render } from '../dist/server/entry-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || '/';
    const urlPath = url.split('?')[0]; // Remove query parameters
    
    // Skip API routes
    if (urlPath.startsWith('/api/')) {
      return res.status(404).send('Not Found');
    }
    
    // Check if this is a static verification/file that should be served directly
    // (Google verification, sitemap, robots.txt, etc.)
    if (urlPath.includes('google') && urlPath.endsWith('.html')) {
      // Try to serve the file directly from dist/client
      const staticFilePath = path.resolve(__dirname, '../dist/client', urlPath);
      try {
        if (fs.existsSync(staticFilePath)) {
          const fileContent = fs.readFileSync(staticFilePath, 'utf-8');
          return res.status(200)
            .setHeader('Content-Type', 'text/html')
            .send(fileContent);
        }
      } catch (err) {
        console.error('Error serving static file:', err);
      }
      // If file doesn't exist, return 404 so Vercel can try to serve it from public
      return res.status(404).send('Not Found');
    }
    
    // Same for sitemap and robots
    if (urlPath === '/sitemap.xml' || urlPath === '/robots.txt') {
      const staticFilePath = path.resolve(__dirname, '../dist/client', urlPath);
      try {
        if (fs.existsSync(staticFilePath)) {
          const fileContent = fs.readFileSync(staticFilePath, 'utf-8');
          const contentType = urlPath.endsWith('.xml') ? 'application/xml' : 'text/plain';
          return res.status(200)
            .setHeader('Content-Type', contentType)
            .send(fileContent);
        }
      } catch (err) {
        console.error('Error serving static file:', err);
      }
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
