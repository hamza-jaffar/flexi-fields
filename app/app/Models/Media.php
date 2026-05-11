<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
class Media extends Model
{
    protected $fillable = [
        'shop_id',
        'filename',
        'original_name',
        'mime_type',
        'file_size',
        'path',
        'url',
        'product_id',
    ];
 
    /**
     * Get the shop that owns the media.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
