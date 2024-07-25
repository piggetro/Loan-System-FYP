export const EquipmentStatus = {
    LOST: "LOST",
    DAMAGED: "DAMAGED",
    LOANED: "LOANED",
    AVAILABLE: "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    MISSING_CHECKLIST_ITEMS: "MISSING_CHECKLIST_ITEMS"
} as const;
export type EquipmentStatus = (typeof EquipmentStatus)[keyof typeof EquipmentStatus];
export const LoanStatus = {
    PENDING_APPROVAL: "PENDING_APPROVAL",
    REJECTED: "REJECTED",
    REQUEST_COLLECTION: "REQUEST_COLLECTION",
    PREPARING: "PREPARING",
    READY: "READY",
    COLLECTED: "COLLECTED",
    CANCELLED: "CANCELLED",
    RETURNED: "RETURNED",
    PARTIAL_RETURN: "PARTIAL_RETURN"
} as const;
export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];
export const LoanedItemsStatus = {
    REQUEST_COLLECTION: "REQUEST_COLLECTION",
    PREPARING: "PREPARING",
    READY: "READY",
    COLLECTED: "COLLECTED",
    RETURNED: "RETURNED",
    DAMAGED: "DAMAGED",
    LOST: "LOST",
    CANCELLED: "CANCELLED",
    MISSING_CHECKLIST_ITEMS: "MISSING_CHECKLIST_ITEMS",
    REJECTED: "REJECTED"
} as const;
export type LoanedItemsStatus = (typeof LoanedItemsStatus)[keyof typeof LoanedItemsStatus];
export const WaiveRequestStatus = {
    AWAITING_REQUEST: "AWAITING_REQUEST",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    RESOLVED: "RESOLVED",
    REJECTED: "REJECTED"
} as const;
export type WaiveRequestStatus = (typeof WaiveRequestStatus)[keyof typeof WaiveRequestStatus];
