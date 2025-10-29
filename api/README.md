# A's Solution Raffle API

PHP-based REST API for the raffle system using MySQL database.

## Server Setup Instructions

### 1. Upload Files to Server

Upload the entire `api` folder to your server at: `/var/www/html/api/`

```bash
# From your local machine, upload to server
scp -r api/* root@128.199.133.218:/var/www/html/api/
```

### 2. Create MySQL Database

SSH into your server and run:

```bash
ssh root@128.199.133.218
mysql -u root -p < /var/www/html/api/setup-database.sql
```

Or manually create the database:

```bash
mysql -u root -p
# Then run the SQL commands from setup-database.sql
```

### 3. Configure Database Connection

Edit `/var/www/html/api/config.php` and update:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'asolution_raffle');
define('DB_USER', 'root');  // Or your MySQL user
define('DB_PASS', 'YOUR_PASSWORD');  // Your MySQL password
```

### 4. Set Permissions

```bash
chmod 755 /var/www/html/api
chmod 644 /var/www/html/api/*.php
```

### 5. Test API

Visit in browser:
- http://128.199.133.218/api/settings.php
- Should return JSON: `null` or settings data

## API Endpoints

### Settings API (`settings.php`)
- **GET** - Retrieve current raffle settings
- **POST** - Create/update raffle settings

### Entries API (`entries.php`)
- **GET** - Get all entries
- **POST** - Add new entry
- **DELETE** - Delete entry by ID

### Winners API (`winners.php`)
- **GET** - Get winners (add `?published=true` for public results)
- **POST** - Draw winners (`action: draw`) or publish results (`action: publish`)
- **DELETE** - Clear all winners

### Bulk Operations API (`bulk.php`)
- **POST** with `action: import_entries` - Bulk import entries
- **POST** with `action: clear_entries` - Clear all entries
- **POST** with `action: reset_raffle` - Reset entire raffle system

## Database Schema

### Tables:
- `raffle_settings` - Raffle configuration (title, times, winner count)
- `raffle_entries` - Participant entries
- `raffle_winners` - Drawn winners with ranks

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console, ensure the API `config.php` has:
```php
header('Access-Control-Allow-Origin: *');
```

### 500 Internal Server Error
- Check PHP error logs: `tail -f /var/log/apache2/error.log`
- Verify database connection in `config.php`
- Ensure MySQL is running: `systemctl status mysql`

### Database Connection Failed
- Verify MySQL credentials in `config.php`
- Check if database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Run setup script if database doesn't exist

## Security Notes

1. **Change default passwords** in `config.php`
2. **Create dedicated MySQL user** instead of using root
3. **Use HTTPS** in production
4. **Disable error display** in production (`ini_set('display_errors', 0)`)
5. **Add rate limiting** for public endpoints
6. **Sanitize all inputs** (already implemented)

## Quick Test Commands

```bash
# Test settings endpoint
curl http://128.199.133.218/api/settings.php

# Add a test entry
curl -X POST http://128.199.133.218/api/entries.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Get all entries
curl http://128.199.133.218/api/entries.php
```
