import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth';
import { AllowedEmailDomainsService } from './allowed-email-domains.service';

@ApiTags('allowed-email-domains')
@Controller('allowed-email-domains')
export class AllowedEmailDomainsController {
  constructor(
    @Inject(AllowedEmailDomainsService)
    private readonly allowedEmailDomainsService: AllowedEmailDomainsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List active email domains allowed for CMinds operators',
  })
  @ApiResponse({ status: 200, description: 'Active allowlisted domains' })
  async listActiveDomains(): Promise<{ domains: string[] }> {
    const domains =
      await this.allowedEmailDomainsService.listActiveDomains();
    return { domains };
  }
}
