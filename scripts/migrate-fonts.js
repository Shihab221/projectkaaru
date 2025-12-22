// Migration script: move font names accidentally stored in `colors` into `fonts` array
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/projectkaru';

// List of known font names (keep in sync with lib/constants.ts)
const FONT_OPTIONS = [
  'Arial',
  'Verdana',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Palatino',
  'Garamond',
  'Bookman',
  'Comic Sans MS',
];

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected to DB');

  const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Product = mongoose.model('ProductMigration', productSchema);

  // Find products where colors array contains any known font names
  const docs = await Product.find({ colors: { $elemMatch: { $in: FONT_OPTIONS } } }).lean();
  console.log(`Found ${docs.length} products with font names in colors`);

  let updated = 0;
  for (const doc of docs) {
    const colors = Array.isArray(doc.colors) ? doc.colors : [];
    const fonts = Array.isArray(doc.fonts) ? doc.fonts : [];

    const movedFonts = colors.filter((c) => FONT_OPTIONS.includes(c));
    if (movedFonts.length === 0) continue;

    const newColors = colors.filter((c) => !FONT_OPTIONS.includes(c));
    const newFonts = Array.from(new Set([...fonts, ...movedFonts]));

    await Product.updateOne({ _id: doc._id }, { $set: { colors: newColors, fonts: newFonts } });
    updated++;
    console.log(`Updated product ${doc._id}: moved fonts ${JSON.stringify(movedFonts)}`);
  }

  console.log(`Migration complete. Updated ${updated} products.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
