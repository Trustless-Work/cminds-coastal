import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./auth/decorators/public.decorator";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health / hello" })
  getHello(): string {
    return this.appService.getHello();
  }
}
