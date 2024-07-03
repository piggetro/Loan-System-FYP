export const EquipmentStatus = {
    LOST: "LOST",
    BROKEN: "BROKEN",
    LOANED: "LOANED",
    AVAILABLE: "AVAILABLE"
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
    OVERDUE: "OVERDUE",
    PARTIAL_RETURN: "PARTIAL_RETURN"
} as const;
export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];
export const LoanedItemsStatus = {
    REQUEST_COLLECTION: "REQUEST_COLLECTION",
    PREPARING: "PREPARING",
    READY: "READY",
    COLLECTED: "COLLECTED",
    RETURNED: "RETURNED",
    BROKEN: "BROKEN",
    LOST: "LOST",
    CANCELLED: "CANCELLED"
} as const;
export type LoanedItemsStatus = (typeof LoanedItemsStatus)[keyof typeof LoanedItemsStatus];
export const WaiveRequestStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
} as const;
export type WaiveRequestStatus = (typeof WaiveRequestStatus)[keyof typeof WaiveRequestStatus];
