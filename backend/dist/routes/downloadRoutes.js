"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const downloadController_1 = require("../controllers/downloadController");
const router = (0, express_1.Router)();
const downloadController = new downloadController_1.DownloadController();
router.get('/:token', downloadController.downloadBook);
exports.default = router;
//# sourceMappingURL=downloadRoutes.js.map