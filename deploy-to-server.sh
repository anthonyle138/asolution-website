#!/bin/bash

# ============================================
# A'S SOLUTION RAFFLE SYSTEM DEPLOYMENT SCRIPT
# ============================================

echo "=========================================="
echo "A's Solution Raffle System Deployment"
echo "=========================================="
echo ""

# Server configuration
SERVER_IP="128.199.133.218"
WEB_ROOT="/var/www/html"
API_DIR="$WEB_ROOT/api"

echo "Server: $SERVER_IP"
echo "Web Root: $WEB_ROOT"
echo ""

# Step 1: Create API directory on server
echo "[1/6] Creating API directory..."
ssh root@$SERVER_IP "mkdir -p $API_DIR && chmod 755 $API_DIR"
echo "✓ API directory created"
echo ""

# Step 2: Upload API files
echo "[2/6] Uploading API files..."
scp api/*.php root@$SERVER_IP:$API_DIR/
scp api/setup-database.sql root@$SERVER_IP:$API_DIR/
scp api/README.md root@$SERVER_IP:$API_DIR/
echo "✓ API files uploaded"
echo ""

# Step 3: Set permissions
echo "[3/6] Setting file permissions..."
ssh root@$SERVER_IP "chmod 644 $API_DIR/*.php && chmod 644 $API_DIR/setup-database.sql"
echo "✓ Permissions set"
echo ""

# Step 4: Check if MySQL is installed
echo "[4/6] Checking MySQL installation..."
ssh root@$SERVER_IP "which mysql" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ MySQL is installed"
else
    echo "⚠ MySQL not found. Installing MySQL..."
    ssh root@$SERVER_IP "apt-get update && apt-get install -y mysql-server"
fi
echo ""

# Step 5: Create database
echo "[5/6] Creating database..."
echo "Please enter your MySQL root password when prompted:"
ssh root@$SERVER_IP "mysql -u root -p < $API_DIR/setup-database.sql"

if [ $? -eq 0 ]; then
    echo "✓ Database created successfully"
else
    echo "⚠ Database creation failed. You may need to run this manually:"
    echo "   mysql -u root -p < $API_DIR/setup-database.sql"
fi
echo ""

# Step 6: Test API
echo "[6/6] Testing API..."
API_URL="http://$SERVER_IP/api/settings.php"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ API is accessible!"
    echo ""
    echo "Test the API:"
    echo "   curl $API_URL"
else
    echo "⚠ API test returned HTTP $HTTP_CODE"
    echo "   Check Apache/PHP configuration"
    echo "   Check error logs: tail -f /var/log/apache2/error.log"
fi
echo ""

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update database password in: $API_DIR/config.php"
echo "2. Test the API endpoints:"
echo "   - $API_URL"
echo "   - http://$SERVER_IP/api/entries.php"
echo "3. Visit your website:"
echo "   - https://anthonyle138.github.io/asolution-website/raffle-admin.html"
echo ""
echo "Need help? Check: $API_DIR/README.md"
echo "=========================================="
