FROM php:8.3-fpm-alpine

RUN apk add --no-cache supervisor nginx git unzip icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-install pdo_mysql bcmath intl zip opcache pcntl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 9000
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf", "-n"]
