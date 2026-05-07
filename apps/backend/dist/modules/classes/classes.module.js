"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const classes_controller_1 = require("./classes.controller");
const classes_service_1 = require("./services/classes.service");
const availability_service_1 = require("./services/availability.service");
const jitsi_service_1 = require("./services/jitsi.service");
const minio_service_1 = require("./services/minio.service");
const email_service_1 = require("./services/email.service");
const scheduled_class_entity_1 = require("./entities/scheduled-class.entity");
const availability_slot_entity_1 = require("./entities/availability-slot.entity");
let ClassesModule = class ClassesModule {
};
exports.ClassesModule = ClassesModule;
exports.ClassesModule = ClassesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([scheduled_class_entity_1.ScheduledClass, availability_slot_entity_1.AvailabilitySlot])],
        controllers: [classes_controller_1.ClassesController, classes_controller_1.TeachersController, classes_controller_1.WebhooksController],
        providers: [
            classes_service_1.ClassesService,
            availability_service_1.AvailabilityService,
            jitsi_service_1.JitsiService,
            minio_service_1.MinioService,
            email_service_1.EmailService,
        ],
        exports: [classes_service_1.ClassesService, availability_service_1.AvailabilityService, jitsi_service_1.JitsiService, minio_service_1.MinioService],
    })
], ClassesModule);
//# sourceMappingURL=classes.module.js.map