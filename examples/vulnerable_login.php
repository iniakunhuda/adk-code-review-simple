<?php
// VULNERABLE LOGIN SYSTEM - For Code Review Testing
// This code contains MULTIPLE security vulnerabilities

// Database credentials - HARDCODED SECRETS
$db_host = "localhost";
$db_user = "admin";
$db_pass = "Sup3rS3cr3tP@ssw0rd123!";  // 🚨 HARDCODED PASSWORD
$db_name = "myapp_db";
$api_key = "sk-1234567890abcdef";  // 🚨 HARDCODED API KEY

// Connect to database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

function login($username, $password) {
    global $conn;

    $query = "SELECT * FROM users WHERE username = '" . $username . "' AND password = '" . $password . "'";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    return null;
}

// Process login
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST["username"];
    $pass = $_POST["password"];

    $account = login($user, $pass);

    if ($account) {
        echo "<h1>Welcome, " . $account['username'] . "!</h1>";
        echo "<p>Your email: " . $account['email'] . "</p>";

        $_SESSION['user_id'] = $account['id'];

        error_log("User logged in: " . $user . " with pass: " . $pass);

        header("Location: dashboard.php");
    } else {
        echo "<p style='color:red'>Login failed for: " . $user . "</p>";
    }
}

function searchUsers($search) {
    global $conn;

    $sql = "SELECT * FROM users WHERE name LIKE '%" . $search . "%'";
    return $conn->query($sql);
}

function executeCommand($cmd) {
    $output = shell_exec("ping -c 4 " . $_GET['ip']);
    return "<pre>" . $output . "</pre>";
}

function downloadFile($filename) {
    $file = "/var/www/uploads/" . $_GET['file'];
    readfile($file);
}
?>
