#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function packageWordPress() {
    console.log('📦 Packaging WordPress plugin...');
    
    const distDir = path.join(rootDir, 'dist');
    const wpDir = path.join(rootDir, 'wordpress');
    const buildDir = path.join(rootDir, 'build-wp');
    const outputFile = path.join(distDir, 'chatbot-widget-wordpress.zip');
    
    // Clean build directory
    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(buildDir, { recursive: true });
    
    // Create plugin directory structure
    const pluginDir = path.join(buildDir, 'chatbot-widget');
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'admin'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'assets'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'languages'), { recursive: true });
    
    // Copy WordPress plugin files
    console.log('📋 Copying plugin files...');
    
    // Copy main plugin file
    fs.copyFileSync(
        path.join(wpDir, 'chatbot-widget.php'),
        path.join(pluginDir, 'chatbot-widget.php')
    );
    
    // Copy admin files
    fs.copyFileSync(
        path.join(wpDir, 'admin', 'settings-page.php'),
        path.join(pluginDir, 'admin', 'settings-page.php')
    );

    fs.copyFileSync(
        path.join(wpDir, 'admin', 'admin.css'),
        path.join(pluginDir, 'admin', 'admin.css')
    );

    fs.copyFileSync(
        path.join(wpDir, 'admin', 'admin.js'),
        path.join(pluginDir, 'admin', 'admin.js')
    );
    
    // Copy readme
    fs.copyFileSync(
        path.join(wpDir, 'readme.txt'),
        path.join(pluginDir, 'readme.txt')
    );
    
    // Copy uninstall script
    const uninstallSrc = path.join(wpDir, 'uninstall.php');
    if (fs.existsSync(uninstallSrc)) {
        fs.copyFileSync(
            uninstallSrc,
            path.join(pluginDir, 'uninstall.php')
        );
    }

    // Copy languages directory
    const languagesDir = path.join(wpDir, 'languages');
    if (fs.existsSync(languagesDir)) {
        const languageFiles = fs.readdirSync(languagesDir);
        languageFiles.forEach(file => {
            fs.copyFileSync(
                path.join(languagesDir, file),
                path.join(pluginDir, 'languages', file)
            );
        });
    }
    
    // Copy the built widget JavaScript
    const widgetJs = path.join(distDir, 'chatbot-widget.js');
    if (fs.existsSync(widgetJs)) {
        fs.copyFileSync(
            widgetJs,
            path.join(pluginDir, 'assets', 'chatbot-widget.js')
        );
        
        // Copy sourcemap if it exists
        const sourceMap = path.join(distDir, 'chatbot-widget.js.map');
        if (fs.existsSync(sourceMap)) {
            fs.copyFileSync(
                sourceMap,
                path.join(pluginDir, 'assets', 'chatbot-widget.js.map')
            );
        }
    } else {
        console.warn('⚠️  Warning: chatbot-widget.js not found in dist/. Run "npm run build" first.');
    }
    
    // Create LICENSE file
    fs.writeFileSync(
        path.join(pluginDir, 'LICENSE'),
        `GPL v2 or later
https://www.gnu.org/licenses/gpl-2.0.html`
    );
    
    // Create the zip file
    console.log('🗜️  Creating zip archive...');
    
    // Dynamic import archiver
    let archiver;
    try {
        const archiverModule = await import('archiver');
        archiver = archiverModule.default;
    } catch (e) {
        console.log('📦 Installing archiver for packaging...');
        execSync('npm install --save-dev archiver', { stdio: 'inherit', cwd: rootDir });
        const archiverModule = await import('archiver');
        archiver = archiverModule.default;
    }
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputFile);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        
        output.on('close', () => {
            const size = (archive.pointer() / 1024).toFixed(2);
            console.log(`✅ WordPress plugin packaged successfully!`);
            console.log(`📦 Output: ${outputFile}`);
            console.log(`📏 Size: ${size} KB`);
            
            // Clean up build directory
            fs.rmSync(buildDir, { recursive: true, force: true });
            resolve();
        });
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        archive.directory(pluginDir, 'chatbot-widget');
        archive.finalize();
    });
}

packageWordPress().catch(console.error);
