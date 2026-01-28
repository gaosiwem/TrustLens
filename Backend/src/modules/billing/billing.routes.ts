import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getBillingProfile,
  updateBillingProfile,
} from "./profile.controller.js";
import {
  getAllInvoices,
  createAdHocInvoice,
  updateInvoiceStatus,
  getInvoicePreview,
  resendInvoice,
} from "./admin-invoice.controller.js";
import { authenticateAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authenticate, getBillingProfile);
router.post("/profile", authenticate, updateBillingProfile);

// Admin Routes
router.get("/admin/invoices", authenticate, authenticateAdmin, getAllInvoices);
router.post(
  "/admin/invoices",
  authenticate,
  authenticateAdmin,
  createAdHocInvoice,
);
router.put(
  "/admin/invoices/:id/status",
  authenticate,
  authenticateAdmin,
  updateInvoiceStatus,
);
router.get(
  "/admin/invoices/:id/preview",
  authenticate,
  authenticateAdmin,
  getInvoicePreview,
); // NEW
router.post(
  "/admin/invoices/:id/send",
  authenticate,
  authenticateAdmin,
  resendInvoice,
); // NEW

export default router;
