import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../config/database";

export const productionController = {
  // Get all production sections
  async getSections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sections = await (prisma as any).production_sections.findMany({
        where: { isActive: true },
        orderBy: { sequence: "asc" },
      });

      res.json({
        status: "success",
        data: sections,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all warehouses
  async getWarehouses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouses = await prisma.warehouses.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });

      res.json({
        status: "success",
        data: warehouses,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create scan log
  async createScanLog(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        productId,
        actionType,
        quantity,
        locationCode,
        locationName,
        sectionId,
        orderId,
        warehouseId,
        latitude,
        longitude,
        notes,
      } = req.body;

      const generateId = () =>
        Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

      const scanLog = await (prisma as any).scan_logs.create({
        data: {
          id: generateId(),
          productId,
          actionType,
          quantity: parseInt(quantity),
          locationCode: locationCode || null,
          locationName: locationName || null,
          sectionId: sectionId || null,
          orderId: orderId || null,
          warehouseId: warehouseId || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          notes: notes || null,
          scannedById: req.user!.id,
        },
        include: {
          products: true,
          production_sections: true,
          warehouses: true,
          users_scan_logs_scannedByIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update inventory based on action type
      if (
        warehouseId &&
        (actionType === "RECEIVE" ||
          actionType === "ISSUE" ||
          actionType === "RETURN")
      ) {
        const inventory = await prisma.inventory.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId,
            },
          },
        });

        if (inventory) {
          const quantityChange =
            actionType === "RECEIVE" || actionType === "RETURN"
              ? quantity
              : -quantity;

          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: inventory.quantity + quantityChange,
              availableQty: inventory.availableQty + quantityChange,
              lastStockIn:
                actionType === "RECEIVE" || actionType === "RETURN"
                  ? new Date()
                  : inventory.lastStockIn,
              lastStockOut:
                actionType === "ISSUE" ? new Date() : inventory.lastStockOut,
              updatedAt: new Date(),
            },
          });

          // Create inventory log
          const generateLogId = () =>
            Math.random().toString(36).substring(2, 11) +
            Date.now().toString(36);
          await prisma.inventory_logs.create({
            data: {
              id: generateLogId(),
              inventoryId: inventory.id,
              userId: req.user!.id,
              action: actionType,
              quantityBefore: inventory.quantity,
              quantityAfter: inventory.quantity + quantityChange,
              difference: quantityChange,
              notes: notes || `Scanned at ${locationName || locationCode}`,
            },
          });
        }
      }

      res.json({
        status: "success",
        data: scanLog,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get scan logs
  async getScanLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, actionType, sectionId, limit = "50" } = req.query;

      const where: any = {};
      if (productId) where.productId = productId;
      if (actionType) where.actionType = actionType;
      if (sectionId) where.sectionId = sectionId;

      const logs = await (prisma as any).scan_logs.findMany({
        where,
        include: {
          products: true,
          production_sections: true,
          warehouses: true,
          production_orders: true,
          users_scan_logs_scannedByIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { scannedAt: "desc" },
        take: parseInt(limit as string),
      });

      res.json({
        status: "success",
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get production orders
  async getProductionOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { status } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const orders = await (prisma as any).production_orders.findMany({
        where,
        include: {
          products: true,
          users_production_orders_createdByIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          production_processes: {
            include: {
              production_sections: true,
            },
            orderBy: { sequence: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        status: "success",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create production order
  async createProductionOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId, targetQuantity, dueDate, notes } = req.body;

      const generateId = () =>
        Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

      // Generate unique order number: PO-YYYYMMDD-XXXX
      const generateOrderNo = async (): Promise<string> => {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

        // Find the last order number for today
        const todayOrders = await (prisma as any).production_orders.findMany({
          where: {
            orderNo: {
              startsWith: `PO-${dateStr}-`,
            },
          },
          orderBy: {
            orderNo: "desc",
          },
          take: 1,
        });

        let sequence = 1;
        if (todayOrders.length > 0) {
          const lastOrderNo = todayOrders[0].orderNo;
          const lastSequence = parseInt(lastOrderNo.split("-")[2]);
          sequence = lastSequence + 1;
        }

        return `PO-${dateStr}-${sequence.toString().padStart(4, "0")}`;
      };

      const orderNo = await generateOrderNo();

      const order = await (prisma as any).production_orders.create({
        data: {
          id: generateId(),
          orderNo,
          productId,
          targetQuantity: parseInt(targetQuantity),
          dueDate: dueDate ? new Date(dueDate) : null,
          notes: notes || null,
          createdById: req.user!.id,
          updatedAt: new Date(),
        },
        include: {
          products: true,
          users_production_orders_createdByIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create production processes for all active sections
      const sections = await (prisma as any).production_sections.findMany({
        where: { isActive: true },
        orderBy: { sequence: "asc" },
      });

      for (const section of sections) {
        await (prisma as any).production_processes.create({
          data: {
            id: generateId(),
            orderId: order.id,
            sectionId: section.id,
            sequence: section.sequence,
            status: "PENDING",
            quantity: 0,
            updatedAt: new Date(),
          },
        });
      }

      // Fetch order with processes
      const orderWithProcesses = await (
        prisma as any
      ).production_orders.findUnique({
        where: { id: order.id },
        include: {
          products: true,
          users_production_orders_createdByIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          production_processes: {
            include: {
              production_sections: true,
            },
            orderBy: {
              sequence: "asc",
            },
          },
        },
      });

      res.json({
        status: "success",
        data: orderWithProcesses,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update production order status
  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, completedQuantity, notes } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (status) updateData.status = status;
      if (completedQuantity !== undefined)
        updateData.completedQuantity = parseInt(completedQuantity);
      if (notes !== undefined) updateData.notes = notes;

      // Auto-set dates based on status
      if (status === "IN_PROGRESS") {
        const currentOrder = await (prisma as any).production_orders.findUnique({
          where: { id },
          select: { startDate: true },
        });
        if (!currentOrder.startDate) {
          updateData.startDate = new Date();
        }
      }
      if (status === "COMPLETED") {
        updateData.completedDate = new Date();

        // Get order to set completedQuantity = targetQuantity
        const existingOrder = await (
          prisma as any
        ).production_orders.findUnique({
          where: { id },
          select: { targetQuantity: true },
        });
        if (existingOrder && completedQuantity === undefined) {
          updateData.completedQuantity = existingOrder.targetQuantity;
        }

        // Auto-complete all processes when order is completed
        await (prisma as any).production_processes.updateMany({
          where: {
            orderId: id,
            status: { not: "COMPLETED" },
          },
          data: {
            status: "COMPLETED",
            endTime: new Date(),
            quantity: existingOrder?.targetQuantity || 0,
          },
        });
      }

      const order = await (prisma as any).production_orders.update({
        where: { id },
        data: updateData,
        include: {
          products: true,
          users_production_orders_createdByIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          production_processes: {
            include: {
              production_sections: true,
            },
            orderBy: { sequence: "asc" },
          },
        },
      });

      res.json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete production order
  async deleteOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await (prisma as any).production_orders.delete({
        where: { id },
      });

      res.json({
        status: "success",
        message: "Production order deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update production process
  async updateProductionProcess(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { status, quantity, notes } = req.body;

      const process = await (prisma as any).production_processes.update({
        where: { id },
        data: {
          status,
          quantity: quantity ? parseInt(quantity) : undefined,
          startTime: status === "IN_PROGRESS" ? new Date() : undefined,
          endTime: status === "COMPLETED" ? new Date() : undefined,
          notes,
        },
        include: {
          production_sections: true,
          production_orders: {
            include: {
              products: true,
            },
          },
        },
      });

      res.json({
        status: "success",
        data: process,
      });
    } catch (error) {
      next(error);
    }
  },
};
