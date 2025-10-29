# A's Solution Raffle System - Complete Setup Guide

## ✅ What's Already Done

1. ✅ All raffle files pushed to GitHub: https://github.com/anthonyle138/asolution-website
2. ✅ Live website at: https://anthonyle138.github.io/asolution-website/
3. ✅ API files uploaded to server at: `/var/www/html/api/`
4. ✅ Extension guide page created: https://anthonyle138.github.io/asolution-website/extension-guide.html

## 📋 Pages Available

- **Extension Guide**: `/extension-guide.html` - Vietnamese guide for installing Chrome extension
- **Raffle Entry**: `/raffle-entries.html` - Public page for participants to submit entries
- **Raffle Admin**: `/raffle-admin.html` - Admin panel to manage raffle and draw winners
- **Raffle Results**: `/raffle-results.html` - Public results page showing winners

## 🔧 Server Setup (Need to Complete)

### Step 1: SSH to Your Server

```bash
ssh root@128.199.133.218
```

### Step 2: Install MySQL (if not installed)

```bash
# Check if MySQL is installed
which mysql

# If not installed, install it:
apt-get update
apt-get install -y mysql-server

# Start MySQL service
systemctl start mysql
systemctl enable mysql
```

### Step 3: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Inside MySQL, run these commands:
CREATE DATABASE IF NOT EXISTS asolution_raffle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE asolution_raffle;

# Create tables
CREATE TABLE IF NOT EXISTS raffle_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    winner_count INT NOT NULL DEFAULT 1,
    status ENUM('not_started', 'active', 'ended') NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS raffle_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    submitted_from ENUM('public', 'admin', 'bulk') NOT NULL DEFAULT 'public',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS raffle_winners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entry_id INT NOT NULL,
    rank INT NOT NULL,
    drawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (entry_id) REFERENCES raffle_entries(id) ON DELETE CASCADE,
    INDEX idx_rank (rank),
    INDEX idx_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Exit MySQL
EXIT;
```

### Step 4: Update Database Configuration

```bash
# Edit the config file
nano /var/www/html/api/config.php

# Update these lines with your MySQL password:
define('DB_HOST', 'localhost');
define('DB_NAME', 'asolution_raffle');
define('DB_USER', 'root');
define('DB_PASS', 'YOUR_MYSQL_PASSWORD_HERE');  # ← Change this!

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Step 5: Install/Configure Apache & PHP

```bash
# Install if not already installed
apt-get install -y apache2 php php-mysql libapache2-mod-php

# Enable PHP and restart Apache
a2enmod php8.1  # or your PHP version
systemctl restart apache2

# Check Apache status
systemctl status apache2
```

### Step 6: Test the API

```bash
# Test settings endpoint
curl http://128.199.133.218/api/settings.php

# Should return: null  (or existing settings if any)

# Test adding an entry
curl -X POST http://128.199.133.218/api/entries.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Should return: Created entry with ID

# Get all entries
curl http://128.199.133.218/api/entries.php

# Should return: JSON array of entries
```

## 🎯 How the System Works

### For Participants:
1. Visit: https://anthonyle138.github.io/asolution-website/raffle-entries.html
2. Fill in name, email, phone
3. Agree to terms and submit
4. Entry is saved to MySQL database on your server (128.199.133.218)

### For Admin (You):
1. Visit: https://anthonyle138.github.io/asolution-website/raffle-admin.html
2. Set raffle title, start time, end time, number of winners
3. Add entries manually or bulk import from CSV
4. View all entries in real-time
5. When raffle ends, click "Draw Winners" to randomly select
6. Preview winners, then click "Publish Results"

### For Public Results:
1. Visit: https://anthonyle138.github.io/asolution-website/raffle-results.html
2. See published winners with ranks (🥇🥈🥉)
3. Shows total entries, winner count, draw date

## 🔐 Extension Guide

The extension guide page teaches users (in Vietnamese) how to:
1. Download the Chrome extension: `As-chrome-extension-1.0.0.zip`
2. Install it in Chrome (Developer mode)
3. Login to Shopee
4. Click extension to copy cookies in Base64 format

Visit: https://anthonyle138.github.io/asolution-website/extension-guide.html

## ⚠️ Important Notes

### Current Setup Status:
- ✅ GitHub website: **LIVE**
- ✅ API files on server: **UPLOADED**
- ⚠️ MySQL database: **NEEDS SETUP** (follow Step 3 above)
- ⚠️ config.php password: **NEEDS UPDATE** (follow Step 4 above)

### JavaScript Files:
The JavaScript files currently use `localStorage` (browser storage). After you complete the database setup and confirm the API works, I can update the JavaScript to use the API instead. This will make the raffle work across all devices.

To enable API mode:
1. Complete Steps 1-6 above
2. Test that API endpoints work
3. Let me know, and I'll update the JavaScript files to use API

### Security:
- Change the MySQL password in `config.php`
- Consider using HTTPS (Let's Encrypt certificate)
- Add rate limiting for public entry endpoint
- Consider creating a dedicated MySQL user instead of using root

## 📞 Next Steps

1. **Immediately**: SSH to server and complete Steps 1-6
2. **Test**: Verify API endpoints work with curl commands
3. **Update**: Let me know when ready, I'll update JavaScript to use API
4. **Launch**: Start using the raffle system!

## 🐛 Troubleshooting

### API returns 500 error:
- Check: `/var/log/apache2/error.log`
- Verify MySQL credentials in `config.php`
- Ensure MySQL service is running

### API returns 404:
- Verify files exist: `ls /var/www/html/api/`
- Check Apache document root: `/var/www/html`

### CORS errors in browser:
- Check `config.php` has CORS headers
- Try accessing from same domain

### Database connection failed:
- Test MySQL: `mysql -u root -p -e "SHOW DATABASES;"`
- Verify database exists: `asolution_raffle`

## 📊 Current Architecture

```
User Browser
    ↓
GitHub Pages (anthonyle138.github.io)
    ↓ (API calls)
Your Server (128.199.133.218)
    ↓
PHP API (/var/www/html/api/)
    ↓
MySQL Database (asolution_raffle)
```

## 🎉 Features

- ✅ Modern UI with purple/cyan A's Solution theme
- ✅ Real-time raffle status (not started/active/ended)
- ✅ Duplicate email prevention
- ✅ Bulk entry import (CSV format)
- ✅ Random winner selection
- ✅ Preview before publishing results
- ✅ Mobile responsive design
- ✅ Vietnamese extension installation guide
- ✅ Particle background effects
- ✅ Glass-morphism design

Good luck! 🚀
