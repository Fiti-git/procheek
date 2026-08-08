import { IsNumber, IsOptional, IsString } from 'class-validator';

export class WebhookDto {
  @IsString()
  provider_ref!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  event_id?: string;

  @IsOptional()
  @IsString()
  signature?: string;
}

export class SimulateWebhookDto {
  @IsOptional()
  @IsString()
  status?: string;
}
