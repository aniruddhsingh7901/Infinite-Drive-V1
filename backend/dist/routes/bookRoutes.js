"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/add', authMiddleware_1.authenticate, bookController_1.addBook);
router.get('/', bookController_1.getBooks);
// router.get('/admin',authenticate, getBooks);
router.get('/:id', bookController_1.getBookById);
router.put('/:id', authMiddleware_1.authenticate, bookController_1.updateBook); // Add this line to create the PUT endpoint
router.delete('/:id', authMiddleware_1.authenticate, bookController_1.deleteBook);
exports.default = router;
//# sourceMappingURL=bookRoutes.js.map