import { Router } from 'express';
import { addBook, getBooks, updateBook, deleteBook, getBookById } from '../controllers/bookController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/add', authenticate, addBook);
router.get('/', getBooks);
// router.get('/admin',authenticate, getBooks);
router.get('/:id', getBookById);
router.put('/:id', authenticate, updateBook); // Add this line to create the PUT endpoint
router.delete('/:id', authenticate, deleteBook);

export default router;