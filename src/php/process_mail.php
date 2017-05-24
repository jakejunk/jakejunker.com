<?php

session_start();

function verifyFormToken($form)
{    
	if(!isset($_SESSION[$form . "_token"])                  // Check if token was sent
    || !isset($_POST["token"])                              // Check if form sent a token
    || ($_SESSION[$form . "_token"] !== $_POST["token"]))   // Compare the tokens
    { 
		return false;
    }
	
	return true;
}

function stripcleantohtml($s)
{
    // From: https://css-tricks.com/serious-form-security/
    // Restores the added slashes (ie.: " I\'m John " for security in output, and escapes them in htmlentities(ie.:  &quot; etc.)
    // Also strips any <html> tags it may encouter
    // Use: Anything that shouldn't contain html (pretty much everything that is not a textarea)
    return htmlentities(trim(strip_tags(stripslashes($s))), ENT_NOQUOTES, "UTF-8");
}

if (verifyFormToken('ef'))
{
    $whitelist = array('token', 'name', 'email', 'message');

    // Check each field for valid names
    foreach ($_POST as $key=>$item)
    {
		if (!in_array($key, $whitelist))
        {
			die('Please use only the fields in the form');
        }
    }

    $message = '';
    $message .= 'Name:    ' . stripcleantohtml($_POST['name']) . "\n";
    $message .= 'Email:   ' . stripcleantohtml($_POST['email']) . "\n";
    $message .= 'Message: ' . stripcleantohtml($_POST['message']);

    $emailFrom = 'contact@jakejunker.com';
    $emailTo =   'contact@jakejunker.com';
    $subject =   'Contact Form Submission';

    $success = @mail($emailTo, $subject, $message, "From: <$emailFrom>");

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';

    if ($success)
    {
        header('Location: ' . $protocol . $_SERVER['HTTP_HOST'] . '/contact/thank-you/');
        //header("Location: /contact/thank-you/");
    }
    else
    {
        header('Location: ' . $protocol . $_SERVER['HTTP_HOST'] . '/contact/oops/');
    }
    return;
}
else
{
    //echo "Oops";
}


?>