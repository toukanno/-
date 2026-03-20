<?php
session_start();

// Request method check
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

// Generate CSRF token
$csrf_token = bin2hex(random_bytes(32));
$_SESSION['csrf_token'] = $csrf_token;

// Sanitize input for display (prevent XSS)
$name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
$mail = htmlspecialchars($_POST['mail'] ?? '', ENT_QUOTES, 'UTF-8');
$age = htmlspecialchars($_POST['age'] ?? '', ENT_QUOTES, 'UTF-8');
$comments = htmlspecialchars($_POST['comments'] ?? '', ENT_QUOTES, 'UTF-8');
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
    <h1>お問い合わせ内容確認</h1>

    <div class="confirm">
      <p>お問い合わせ内容はこちらで宜しいでしょうか？<br>
        よろしければ「送信する」ボタンを押して下さい。
      </p>
      <p>名前
        <br>
        <?php echo $name; ?>
      </p>

      <p>メールアドレス
        <br>
        <?php echo $mail; ?>
      </p>

      <p>年齢
        <br>
        <?php echo $age; ?>
      </p>

      <p>コメント
        <br>
        <?php echo $comments; ?>
      </p>

      <form action="contact.html">
        <input type="submit" class="button1" value="戻って修正する" />
      </form>

      <form action="insert.php" method="post">
        <input type="submit" class="button2" value="登録する" />
        <input type="hidden" value="<?php echo $name; ?>" name="name">
        <input type="hidden" value="<?php echo $mail; ?>" name="mail">
        <input type="hidden" value="<?php echo $age; ?>" name="age">
        <input type="hidden" value="<?php echo $comments; ?>" name="comments">
        <input type="hidden" value="<?php echo $csrf_token; ?>" name="csrf_token">

      </form>
    </div>


  </body>

</html>
