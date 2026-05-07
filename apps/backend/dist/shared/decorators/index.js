"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = exports.CurrentUser = exports.TenantHeader = exports.Roles = exports.ROLES_KEY = exports.Public = exports.IS_PUBLIC_KEY = void 0;
exports.IsFutureDate = IsFutureDate;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.TenantHeader = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantSlug = request.headers['x-tenant-slug'];
    return data ? tenantSlug?.[data] : tenantSlug;
});
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});
exports.Pagination = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(data.maxLimit || 100, Math.max(1, parseInt(query.limit, 10) || data.defaultLimit || 20));
    return { page, limit, offset: (page - 1) * limit };
});
function IsFutureDate(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isFutureDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    const date = new Date(value);
                    return date > new Date();
                },
                defaultMessage(args) {
                    return `${args.property} must be a future date`;
                },
            },
        });
    };
}
//# sourceMappingURL=index.js.map