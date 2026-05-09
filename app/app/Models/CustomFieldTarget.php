<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable('custom_field_id', 'target_id')]
class CustomFieldTarget extends Model
{
    public function customField()
    {
        return $this->belongsTo(CustomField::class);
    }
}
