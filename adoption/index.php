<?php 

use chillerlan\QRCode\{QRCode, QROptions};

require_once './vendor/autoload.php';

$data   = 'otpauth://totp/test?secret=B3JX4VCVJDVNXNZ5&issuer=chillerlan.net';
$qrcode = (new QRCode)->render($data);

// default output is a base64 encoded data URI
printf('<img src="%s" alt="QR Code" />', $qrcode);


?>
