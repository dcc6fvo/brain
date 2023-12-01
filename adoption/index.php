<?php 

use chillerlan\QRCode\{QRCode, QROptions};

require_once './vendor/autoload.php';

function firstDiskUUID() {
    $uuids = shell_exec("blkid -o value -s UUID");  
    $uuids_array = preg_split('/\s+/', $uuids);
    $uuid='';

    foreach ($uuids_array as &$value) {
        if (strlen($value) == 36){
            $uuid=$value;
            break;
        }
    }
    return $uuid;
}

function generateQRCode($uuid){
    $data   = $uuid;
    $qrcode = (new QRCode)->render($data);
    return $qrcode;
}

function humanhash($uuid) {
    return before('-', $uuid);
}

function before($a, $b){
    return substr($b, 0, strpos($b, $a));
}

$uuid = firstDiskUUID();
$humanhash = humanhash($uuid);
$qrcode = generateQRCode($humanhash);
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="styles/reset.css" />
    <link rel="stylesheet" type="text/css" href="styles/index.css" />
    <title>Document</title>
</head>

<body>

    <section id="main" name="main" class="container">

        <h1>
            Awaiting Adoption
        </h1>

        <h2>
            <?php
            echo strtoupper($humanhash);
            ?>
        </h2>

        <?php
        // default output is a base64 encoded data URI
        printf('<img class="qrcode" src="%s" alt="QR Code" />', $qrcode);
        ?>

    </section>

</body>
</html>