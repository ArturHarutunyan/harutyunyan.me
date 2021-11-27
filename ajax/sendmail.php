<?php
if (!isset($_POST['email']) || !isset($_POST['name']) || !isset($_POST['subject']) || !isset($_POST['message'])) {
	exit("0");
}
ini_set("display_errors", true);
error_reporting(E_ALL);

require_once "./phpmayler/PHPMailerAutoload.php";

$mail = new PHPMailer(true);
try {

	$mail->IsSMTP(); // telling the class to use SMTP
	//$mail->SMTPDebug  = 1;                     // enables SMTP debug information (for testing)
	$mail->SMTPAuth   = true;                  // enable SMTP authentication
	$mail->SMTPSecure = "ssl";                 // sets the prefix to the servier
	$mail->Host       = "smtp.yandex.ru";      // sets GMAIL as the SMTP server
	$mail->Port       = 465;   // set the SMTP port for the GMAIL server
	$mail->Username   = "artur@neen.am";  // username
	$mail->Password   = "neen.123";            // password

	$mail->SetFrom("artur@neen.am", $_POST['name']);

	$mail->Subject    = "harutyunyan.me conact us";
	$message = "NAME - ".$_POST['name']."<br>EMAIL - ".$_POST['email']." <br> SUBJECT - ".$_POST['subject']." <br> Text - ".$_POST['message'];
	$mail->IsHTML(true); 
	$mail->MsgHTML($message);

	$mail->AddAddress("artur@harutyunyan.me", "Artur Harutyunyan" );
	if(!$mail->Send()){
		echo "string";
		exit("0");
	}
	exit("1");

} catch (phpmailerException $e) {
	echo $e->errorMessage(); //Pretty error messages from PHPMailer
	exit("0");

} catch (Exception $e) {
	echo $e->getMessage(); //Boring error messages from anything else!
	exit("0");

}




?>