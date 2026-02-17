<?php
header('Content-Type: application/json');

// Remplacez par votre adresse email réelle
$recipient = "princelah98@gmail.com";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $phone = strip_tags(trim($_POST["phone"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $service = strip_tags(trim($_POST["service"]));
    $budget = strip_tags(trim($_POST["budget"]));
    $message = trim($_POST["message"]);

    // Validation basique
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Veuillez remplir les champs obligatoires."]);
        exit;
    }

    $subject = "Nouveau contact PLCORP de $name";
    
    $email_content = "Nom: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Téléphone: $phone\n";
    $email_content .= "Pôle concerné: $service\n";
    $email_content .= "Budget: $budget\n\n";
    $email_content .= "Message:\n$message\n";

    $email_headers = "From: $name <$email>";

    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur serveur lors de l'envoi."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
}
?>