import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  // Gateway readiness: 다운스트림 서비스(auth, user)의 liveness ping
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () =>
        this.http.pingCheck('auth-service', 'http://auth-service:4000/health'),
      () =>
        this.http.pingCheck('user-service', 'http://user-service:4001/health'),
    ]);
  }
}
