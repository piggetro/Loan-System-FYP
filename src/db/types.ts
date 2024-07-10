import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { EquipmentStatus, LoanStatus, LoanedItemsStatus, WaiveRequestStatus } from "./enums";

export type AccessRights = {
    id: string;
    pageName: string;
    pageLink: string;
};
export type AccessRightsOnRoles = {
    accessRightId: string;
    roleId: string;
};
export type Category = {
    id: string;
    name: string;
};
export type Course = {
    id: string;
    name: string;
    code: string;
    active: boolean;
};
export type Equipment = {
    id: string;
    name: string;
    photoPath: string | null;
    updatedAt: Timestamp;
    subCategoryId: string | null;
    checklist: string | null;
    active: boolean;
};
export type EquipmentOnCourses = {
    equipmentId: string;
    courseId: string;
};
export type GeneralSettings = {
    id: string;
    startTimeOfCollection: string;
    endTimeOfCollection: string;
    startRequestForCollection: string;
    endRequestForCollection: string;
    voidLoanNumberOfDays: number;
    voidLoanTiming: string;
};
export type Holiday = {
    id: string;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
};
export type Inventory = {
    id: string;
    assetNumber: string;
    remarks: string | null;
    datePurchased: Timestamp | null;
    warrantyExpiry: Timestamp | null;
    cost: string;
    status: EquipmentStatus;
    equipmentId: string | null;
    active: boolean;
};
export type Loan = {
    id: string;
    loanId: string;
    remarks: string;
    dueDate: Timestamp;
    status: LoanStatus;
    signature: string | null;
    loanedById: string | null;
    approvedById: string | null;
    preparedById: string | null;
    issuedById: string | null;
    returnedToId: string | null;
    approvingLecturerId: string | null;
    dateCreated: Generated<Timestamp>;
    collectionReferenceNumber: string | null;
    datePrepared: Timestamp | null;
    dateIssued: Timestamp | null;
    dateCollected: Timestamp | null;
    dateReturned: Timestamp | null;
};
export type LoanItem = {
    id: string;
    loanId: string;
    equipmentId: string | null;
    inventoryId: string | null;
    status: LoanedItemsStatus | null;
};
export type OrganizationUnit = {
    id: string;
    name: string;
};
export type Role = {
    id: string;
    role: string;
};
export type Semesters = {
    id: string;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
};
export type Session = {
    id: string;
    user_id: string;
    expires_at: Timestamp;
};
export type StaffType = {
    id: string;
    name: string;
};
export type SubCategory = {
    id: string;
    name: string;
    categoryId: string;
};
export type User = {
    id: string;
    email: string;
    name: string;
    mobile: string | null;
    hashed_password: string | null;
    batch: string | null;
    graduationDate: Timestamp | null;
    organizationUnitId: string | null;
    staffTypeId: string | null;
    courseId: string | null;
    roleId: string | null;
};
export type UserAccessRights = {
    id: string;
    accessRightId: string;
    grantedUserId: string;
    grantedById: string;
    grantedAt: Generated<Timestamp>;
};
export type VerificationToken = {
    id: string;
    identifier: string;
    token: string;
    expires: Timestamp;
};
export type WaiveRequest = {
    id: string;
    loanId: string;
    reason: string | null;
    remarks: string | null;
    dateIssued: Generated<Timestamp>;
    status: WaiveRequestStatus;
    approvedByUserId: string | null;
    loanItemId: string;
};
export type DB = {
    AccessRights: AccessRights;
    AccessRightsOnRoles: AccessRightsOnRoles;
    Category: Category;
    Course: Course;
    Equipment: Equipment;
    EquipmentOnCourses: EquipmentOnCourses;
    GeneralSettings: GeneralSettings;
    Holiday: Holiday;
    Inventory: Inventory;
    Loan: Loan;
    LoanItem: LoanItem;
    OrganizationUnit: OrganizationUnit;
    Role: Role;
    Semesters: Semesters;
    Session: Session;
    StaffType: StaffType;
    SubCategory: SubCategory;
    User: User;
    UserAccessRights: UserAccessRights;
    VerificationToken: VerificationToken;
    WaiveRequest: WaiveRequest;
};
