import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JitsiService {
  private readonly logger = new Logger(JitsiService.name);
  private readonly jitsiDomain: string;
  private readonly appId: string;
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.jitsiDomain = this.configService.get<string>(
      'JITSI_DOMAIN',
      'meet.jit.si',
    );
    this.appId = this.configService.get<string>(
      'JITSI_APP_ID',
      'quran-academy',
    );
    this.secret = this.configService.get<string>('JITSI_SECRET', '');
  }

  generateRoomName(classId: string): string {
    return `quran-class-${classId}-${Date.now()}`;
  }

  generateToken(params: {
    userId: string;
    userName: string;
    avatar?: string;
    roomName: string;
    isHost?: boolean;
  }): string {
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
      this.logger.warn(
        'JITSI_SECRET not configured, returning placeholder token',
      );
      return 'placeholder-token';
    }

    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
    });
  }

  getJitsiUrl(roomName: string): string {
    return `https://${this.jitsiDomain}/${roomName}`;
  }

  generateRoomAndToken(params: {
    classId: string;
    userId: string;
    userName: string;
    avatar?: string;
    isHost?: boolean;
  }): { roomName: string; token: string; jitsiUrl: string } {
    const roomName = this.generateRoomName(params.classId);
    const token = this.generateToken({
      ...params,
      roomName,
    });
    const jitsiUrl = this.getJitsiUrl(roomName);

    return { roomName, token, jitsiUrl };
  }
}
