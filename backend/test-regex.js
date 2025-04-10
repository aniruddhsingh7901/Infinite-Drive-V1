// Test regex pattern for stripping format suffixes from book IDs

// Sample book IDs
const testIds = [
  '1740927328752-PDF',
  '1740927328752-PDF-PDF',
  '1738867559986-PDF/EPUB',
  '1738867847282'
];

console.log('Testing regex pattern:');
for (const id of testIds) {
  const baseId = id.replace(/-PDF(-PDF)?$|-EPUB(-EPUB)?$|(-PDF\/EPUB)$/, '');
  console.log(`Original ID: ${id} -> Base ID: ${baseId}`);
}
