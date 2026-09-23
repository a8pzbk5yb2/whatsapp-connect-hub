<?php

namespace App\Support;

class Mask
{
    /** EAAG************9XYZ — enough to identify a value, never enough to use it. */
    public static function secret(?string $value, int $head = 4, int $tail = 4): string
    {
        if ($value === null || $value === '') {
            return 'not set';
        }

        if (strlen($value) <= $head + $tail) {
            return str_repeat('*', strlen($value));
        }

        return substr($value, 0, $head)
            .str_repeat('*', max(4, strlen($value) - $head - $tail))
            .substr($value, -$tail);
    }
}
