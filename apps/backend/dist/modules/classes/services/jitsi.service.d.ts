import { ConfigService } from '@nestjs/config';
export declare class JitsiService {
    private readonly configService;
    private readonly logger;
    private readonly jitsiDomain;
    private readonly appId;
    private readonly secret;
    constructor(configService: ConfigService);
    generateRoomName(classId: string): string;
    generateToken(params: {
        userId: string;
        userName: string;
        avatar?: string;
        roomName: string;
        isHost?: boolean;
    }): string;
    getJitsiUrl(roomName: string): string;
    generateRoomAndToken(params: {
        classId: string;
        userId: string;
        userName: string;
        avatar?: string;
        isHost?: boolean;
    }): {
        roomName: string;
        token: string;
        jitsiUrl: string;
    };
}
