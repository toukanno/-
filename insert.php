<?php
mb_internal_encoding("utf8");
session_start();

// CSRF token verification
if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    die('不正なリクエストです。');
}

// Request method check
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('許可されていないメソッドです。');
}

// Input validation
$name = trim($_POST['name'] ?? '');
$mail = trim($_POST['mail'] ?? '');
$age = trim($_POST['age'] ?? '');
$comments = trim($_POST['comments'] ?? '');

if ($name === '' || $mail === '' || $age === '') {
    die('必須項目が入力されていません。');
}

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    die('メールアドレスの形式が正しくありません。');
}

$allowed_ages = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
if (!in_array($age, $allowed_ages, true)) {
    die('年齢の値が不正です。');
}

// Database connection with environment variables and error handling
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'lesson01';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO(
        "mysql:dbname={$db_name};host={$db_host};charset=utf8",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Prepared statement to prevent SQL injection
    $stmt = $pdo->prepare("INSERT INTO contactform(name, mail, age, comments) VALUES (:name, :mail, :age, :comments)");
    $stmt->execute([
        ':name' => $name,
        ':mail' => $mail,
        ':age' => $age,
        ':comments' => $comments,
    ]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    die('データベースエラーが発生しました。しばらくしてから再度お試しください。');
}

// Clear CSRF token after successful submission
unset($_SESSION['csrf_token']);
?>

<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせフォームを作る</title>
  <link rel="stylesheet" type="text/css" href="style2.css">
</head>

<body>
  <h1>お問い合わせフォーム</h1>

  <div class="confirm">
    <p>お問い合わせ有難うございました。<br>3営業日以内に担当者よりご連絡差し上げます。</p>
  </div>
</body>

</html>
