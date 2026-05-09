<?php

namespace App\Enums;

enum BillingInterval: string
{
    case ONE_TIME = 'ONE_TIME';
    case EVERY_30_DAYS = 'EVERY_30_DAYS';
    case EVERY_6_MONTHS = 'EVERY_6_MONTHS';
    case EVERY_12_MONTHS = 'EVERY_12_MONTHS';

    public function label(): string
    {
        return match ($this) {
            self::ONE_TIME => 'One Time',
            self::EVERY_30_DAYS => 'Monthly (30 Days)',
            self::EVERY_6_MONTHS => 'Every 6 Months',
            self::EVERY_12_MONTHS => 'Yearly (12 Months)',
        };
    }
}
