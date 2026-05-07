"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    client;
    constructor(configService) {
        this.configService = configService;
        const redisUrl = this.configService.get('REDIS_URL', 'redis://localhost:6379');
        this.client = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
        this.client.on('error', (err) => {
            this.logger.error(`Redis connection error: ${err.message}`);
        });
        this.client.on('connect', () => {
            this.logger.log('Redis connected');
        });
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async get(key) {
        const value = await this.client.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async set(key, value, ttlSeconds) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        }
        else {
            await this.client.set(key, serialized);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async keys(pattern) {
        return this.client.keys(pattern);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map