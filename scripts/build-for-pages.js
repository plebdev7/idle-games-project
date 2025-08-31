#!/usr/bin/env node

/**
 * Build orchestration script for GitHub Pages deployment
 * 
 * This script:
 * 1. Builds all games with correct GitHub Pages paths
 * 2. Combines all builds into a single dist/ directory
 * 3. Copies the landing page and assets
 * 4. Creates proper routing structure for GitHub Pages
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, copyFileSync, rmSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')

console.log('🚀 Building idle games project for GitHub Pages...\n')

// Clean dist directory
if (existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...')
  rmSync(distDir, { recursive: true, force: true })
}
mkdirSync(distDir, { recursive: true })

// Build configuration for each game
const games = [
  {
    name: 'game-1-basic',
    displayName: 'Basic Idle Game',
    path: 'games/game-1-basic',
    buildScript: 'build:pages',
    outputPath: 'game-1'
  }
  // Future games will be added here:
  // {
  //   name: 'game-2-advanced', 
  //   displayName: 'Advanced Idle Game',
  //   path: 'games/game-2-advanced',
  //   buildScript: 'build:pages',
  //   outputPath: 'game-2'
  // }
]

// Build each game
for (const game of games) {
  console.log(`📦 Building ${game.displayName}...`)
  
  const gamePath = join(rootDir, game.path)
  if (!existsSync(gamePath)) {
    console.log(`⚠️  Game directory not found: ${game.path}`)
    continue
  }

  try {
    // Set environment variable for pages build
    process.env.BUILD_TARGET = 'pages'
    
    // Build the game
    execSync(`npm run ${game.buildScript}`, {
      cwd: gamePath,
      stdio: 'inherit',
      env: { ...process.env, BUILD_TARGET: 'pages' }
    })
    
    console.log(`✅ ${game.displayName} built successfully\n`)
  } catch (error) {
    console.error(`❌ Failed to build ${game.displayName}:`, error.message)
    process.exit(1)
  }
}

// Copy landing page
console.log('🏠 Setting up landing page...')
try {
  // Copy root index.html to dist
  copyFileSync(join(rootDir, 'index.html'), join(distDir, 'index.html'))
  
  // Create a simple 404.html for GitHub Pages SPA routing
  const html404 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Idle Games Project - Game Not Found</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #FFD700;
        }

        .back-link {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            border: none;
            border-radius: 50px;
            color: white;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.3s ease;
        }

        .back-link:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Game Not Found</h1>
        <p>The requested game doesn't exist or is not available yet.</p>
        <a href="/idle-games-project/" class="back-link">🏠 Back to Games</a>
    </div>
</body>
</html>`

  const fs = await import('fs')
  fs.writeFileSync(join(distDir, '404.html'), html404)
  
  console.log('✅ Landing page setup complete\n')
} catch (error) {
  console.error('❌ Failed to setup landing page:', error.message)
  process.exit(1)
}

// Verify build outputs
console.log('🔍 Verifying build outputs...')
for (const game of games) {
  const gameDistPath = join(distDir, game.outputPath)
  if (existsSync(gameDistPath)) {
    const indexPath = join(gameDistPath, 'index.html')
    if (existsSync(indexPath)) {
      console.log(`✅ ${game.displayName} → /${game.outputPath}/`)
    } else {
      console.log(`⚠️  ${game.displayName} missing index.html`)
    }
  } else {
    console.log(`❌ ${game.displayName} build output not found`)
  }
}

// Display deployment summary
console.log('\n🎉 Build completed successfully!')
console.log('\n📁 Deployment structure:')
console.log('   https://plebdev7.github.io/idle-games-project/')
for (const game of games) {
  console.log(`   https://plebdev7.github.io/idle-games-project/${game.outputPath}/`)
}
console.log('\n🚀 Ready to deploy to GitHub Pages!')
console.log('   Push to main branch - GitHub Actions will deploy automatically!')
