"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const courses_controller_1 = require("./courses.controller");
const services_1 = require("./services");
const entities_1 = require("./entities");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const organizations_module_1 = require("../organizations/organizations.module");
const payments_module_1 = require("../payments/payments.module");
let CoursesModule = class CoursesModule {
};
exports.CoursesModule = CoursesModule;
exports.CoursesModule = CoursesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.Course, entities_1.Lesson, entities_1.Enrollment, entities_1.LessonProgress, entities_1.Certificate]),
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => organizations_module_1.OrganizationsModule),
            (0, common_1.forwardRef)(() => payments_module_1.PaymentsModule),
        ],
        controllers: [courses_controller_1.CoursesController],
        providers: [services_1.CoursesService, services_1.LessonsService, services_1.EnrollmentsService, services_1.CertificateService],
        exports: [services_1.CoursesService, services_1.LessonsService, services_1.EnrollmentsService],
    })
], CoursesModule);
//# sourceMappingURL=courses.module.js.map