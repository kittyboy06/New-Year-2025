
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

console.log('Inlining assets for:', indexPath);

try {
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Inline CSS
    const linkRegex = /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const relPath = match[1];
        // Remove ./ or / if present to get clean filename
        const cleanPath = relPath.replace(/^\.?\//, '');
        const fullPath = path.join(distDir, cleanPath);

        console.log(`Inlining CSS: ${cleanPath}`);
        if (fs.existsSync(fullPath)) {
            const css = fs.readFileSync(fullPath, 'utf-8');
            html = html.replace(match[0], `<style>${css}</style>`);
        } else {
            console.warn(`CSS file not found: ${fullPath}`);
        }
    }

    // Inline JS
    // Matches <script type="module" crossorigin src="...">
    const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
    while ((match = scriptRegex.exec(html)) !== null) {
        const relPath = match[1];
        const cleanPath = relPath.replace(/^\.?\//, '');
        const fullPath = path.join(distDir, cleanPath);

        console.log(`Inlining JS: ${cleanPath}`);
        if (fs.existsSync(fullPath)) {
            const js = fs.readFileSync(fullPath, 'utf-8');
            // Remove the script tag and replace with inline module
            // Note: Inlining modules can be tricky, but for a simple app it often works if no external fetches relative to file.
            // Converting to classic script might be needed if module issues arise, but let's try module first.
            html = html.replace(match[0], `<script type="module">${js}</script>`);
        } else {
            console.warn(`JS file not found: ${fullPath}`);
        }
    }

    fs.writeFileSync(indexPath, html);
    console.log('Successfully inlined assets!');

} catch (e) {
    console.error('Error inlining assets:', e);
    process.exit(1);
}
