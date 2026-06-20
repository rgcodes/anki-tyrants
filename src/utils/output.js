import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../../output');

export function writeCards(filename, deck, cards) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const header = `#notetype:Basic\n#deck:${deck}\n#tags column:3\n`;
  const lines = cards.map(c => `${c.front}\t${c.back}\t${c.tags}`);
  const filepath = join(OUTPUT_DIR, `${filename}.txt`);
  writeFileSync(filepath, header + lines.join('\n') + '\n');
  console.log(`  ${filename}: ${cards.length} cards → output/${filename}.txt`);
}
