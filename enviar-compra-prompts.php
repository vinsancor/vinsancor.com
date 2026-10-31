<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'message' => 'Método não permitido.']);
// Honeypot silencioso contra envios automáticos.
if (!empty($_POST['website'] ?? '')) respond(200, ['ok' => true]);
$action = trim((string)($_POST['action'] ?? ''));
$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$whatsapp = trim((string)($_POST['whatsapp'] ?? ''));
$name = preg_replace('/[\r\n\x00-\x1F\x7F]/u', ' ', $name);
$email = preg_replace('/[\r\n\x00-\x1F\x7F]/u', '', $email);
$whatsapp = preg_replace('/[^0-9+() .-]/', '', $whatsapp);
if (!in_array($action, ['purchase', 'paid'], true) || $name === '' || strlen($name) > 160 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 || $whatsapp === '' || strlen($whatsapp) > 40) {
    respond(422, ['ok' => false, 'message' => 'Confira os dados informados.']);
}
$subject = $action === 'purchase' ? 'Nova compra: 8 prompts para pizzarias' : 'Aviso de pagamento: 8 prompts para pizzarias';
$body = "Ação: " . ($action === 'purchase' ? 'Compra iniciada' : 'Cliente informou que pagou') . "\nProduto: 8 prompts para pizzarias\nValor: R$ 6,99\nNome: {$name}\nE-mail: {$email}\nWhatsApp: {$whatsapp}\nData: " . date(DATE_ATOM) . "\n";
$from = 'noreply@vinsancor.com';
$headers = "From: Vinsancor <{$from}>\r\n" . "Reply-To: {$email}\r\n" . "MIME-Version: 1.0\r\n" . "Content-Type: text/plain; charset=UTF-8\r\n";
$sent = @mail('vinsancor@gmail.com', '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $from);
if (!$sent) respond(503, ['ok' => false, 'message' => 'Não foi possível enviar o e-mail agora.']);
respond(200, ['ok' => true]);
?>