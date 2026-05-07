"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLIC_ROUTES = exports.EnrollmentStatus = exports.ClassStatus = exports.SubscriptionTier = exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "super_admin";
    Role["ORG_ADMIN"] = "org_admin";
    Role["TEACHER"] = "teacher";
    Role["STUDENT"] = "student";
    Role["PARENT"] = "parent";
    Role["PARENT_STUDENT"] = "parent_student";
})(Role || (exports.Role = Role = {}));
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "free";
    SubscriptionTier["BASIC"] = "basic";
    SubscriptionTier["PREMIUM"] = "premium";
    SubscriptionTier["INSTITUTION"] = "institution";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
var ClassStatus;
(function (ClassStatus) {
    ClassStatus["PENDING"] = "pending";
    ClassStatus["CONFIRMED"] = "confirmed";
    ClassStatus["SCHEDULED"] = "scheduled";
    ClassStatus["IN_PROGRESS"] = "in_progress";
    ClassStatus["COMPLETED"] = "completed";
    ClassStatus["CANCELLED"] = "cancelled";
})(ClassStatus || (exports.ClassStatus = ClassStatus = {}));
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "active";
    EnrollmentStatus["SUSPENDED"] = "suspended";
    EnrollmentStatus["COMPLETED"] = "completed";
    EnrollmentStatus["CANCELLED"] = "cancelled";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
exports.PUBLIC_ROUTES = [
    '/auth/magic-link',
    '/auth/verify',
    '/health',
    '/organizations/onboard',
];
//# sourceMappingURL=enums.js.map