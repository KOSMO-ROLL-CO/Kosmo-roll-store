import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const INPUT_DIR = 'public/products';
const OUTPUT_DIR = 'public/products';
const QUALITY = 80;

async function optimizeImages() {
  const files = await readdir(INPUT_DIR);
  
  console.log('🪐 Optimizing images for Kosmo Roll...\n');
  
  let optimized = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    
    // Only process JPEG and PNG files
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      skipped++;
      continue;
    }
    
    const inputPath = join(INPUT_DIR, file);
    const outputFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = join(OUTPUT_DIR, outputFile);
    
    try {
      const inputStats = await stat(inputPath);
      
      await sharp(inputPath)
        .webp({ quality: QUALITY })
        .toFile(outputPath);
      
      const outputStats = await stat(outputPath);
      const saved = Math.round((1 - outputStats.size / inputStats.size) * 100);
      
      console.log(`✅ ${file} → ${outputFile} (${saved}% smaller)`);
      optimized++;
    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Optimized: ${optimized} images`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

optimizeImages().catch(console.error);
