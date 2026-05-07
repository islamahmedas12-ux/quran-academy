"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JitsiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitsiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
let JitsiService = JitsiService_1 = class JitsiService {
    configService;
    logger = new common_1.Logger(JitsiService_1.name);
    jitsiDomain;
    appId;
    secret;
    constructor(configService) {
        this.configService = configService;
        this.jitsiDomain = this.configService.get('JITSI_DOMAIN', 'meet.jit.si');
        this.appId = this.configService.get('JITSI_APP_ID', 'quran-academy');
        this.secret = this.configService.get('JITSI_SECRET', '');
    }
    generateRoomName(classId) {
        return `quran-class-${classId}-${Date.now()}`;
    }
    generateToken(params) {
        const { userId, userName, avatar, roomName, isHost = false } = params;
        const payload = {
            iss: this.jitsiDomain,
            aud: this.jitsiDomain,
            sub: this.appId,
            room: roomName,
            user: {
                id: userId,
                name: userName,
                avatar: avatar || '',
            },
            is_host: isHost,
            context: {
                user: {
                    username: userName,
                },
            },
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
        };
        if (!this.secret) {
            this.logger.warn('JITSI_SECRET not configured, returning placeholder token');
            return 'placeholder-token';
        }
        return jwt.sign(payload, this.secret, {
            algorithm: 'HS256',
        });
    }
    getJitsiUrl(roomName) {
        return `https://${this.jitsiDomain}/${roomName}`;
    }
    generateRoomAndToken(params) {
        const roomName = this.generateRoomName(params.classId);
        const token = this.generateToken({
            ...params,
            roomName,
        });
        const jitsiUrl = this.getJitsiUrl(roomName);
        return { roomName, token, jitsiUrl };
    }
};
exports.JitsiService = JitsiService;
exports.JitsiService = JitsiService = JitsiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JitsiService);
//# sourceMappingURL=jitsi.service.js.map