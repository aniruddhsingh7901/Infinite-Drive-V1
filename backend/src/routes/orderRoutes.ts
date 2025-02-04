import { Router } from 'express';
import { checkOrderStatus, getAllOrders, getOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { authenticate } from '../middleware/authMiddleware';


const router = Router();

router.get('/check-status/:orderId', checkOrderStatus);

router.get('/orders/:orderId', getOrder);
router.get('/all-orders', authenticate, getAllOrders);
router.put('/orders/:orderId', updateOrder);
router.delete('/orders/:orderId', deleteOrder);


export default router;