// Test script for book ID format fix
import { Book, Order } from './src/models';
import sequelize from './src/config/database';

async function testBookIdFix() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Get all books
    const books = await Book.findAll();
    console.log('Books:', books.map(b => ({ id: b.id, title: b.title })));

    // Test regex pattern on some sample book IDs
    const testIds = [
      '1740927328752-PDF',
      '1740927328752-PDF-PDF',
      '1738867559986-PDF/EPUB',
      '1738867847282'
    ];

    console.log('\nTesting regex pattern:');
    for (const id of testIds) {
      const baseId = id.replace(/-PDF(-PDF)?$|-EPUB(-EPUB)?$|(-PDF\/EPUB)$/, '');
      console.log(`Original ID: ${id} -> Base ID: ${baseId}`);
    }

    // Try to find a book with a format suffix
    console.log('\nTrying to find books with and without format suffix:');
    for (const id of testIds) {
      // Try with original ID
      const bookWithSuffix = await Book.findByPk(id);
      console.log(`Finding book with ID "${id}": ${bookWithSuffix ? 'Found' : 'Not found'}`);

      // Try with base ID (without suffix)
      const baseId = id.replace(/-PDF(-PDF)?$|-EPUB(-EPUB)?$|(-PDF\/EPUB)$/, '');
      const bookWithoutSuffix = await Book.findByPk(baseId);
      console.log(`Finding book with base ID "${baseId}": ${bookWithoutSuffix ? 'Found' : 'Not found'}`);
    }

    // Get a few orders to check their book IDs
    const orders = await Order.findAll({ limit: 5 });
    console.log('\nOrders:', orders.map(o => ({ id: o.id, bookId: o.bookId, format: o.format })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

testBookIdFix();
