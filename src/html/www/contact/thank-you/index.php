<?php

session_start();

function verifyFormToken()
{    
	if(!isset($_SESSION["ef_token"])                  // Check if token was sent
    || !isset($_POST["token"])                        // Check if form sent a token
    || ($_SESSION["ef_token"] !== $_POST["token"]))   // Compare the tokens
    { 
		return false;
    }
	
	return true;
}

function verifyFormData()
{
    $whitelist = array('token', 'name', 'email', 'message');

    // Check each field for valid names
    foreach ($_POST as $key=>$item)
    {
		if (!in_array($key, $whitelist))
        {
			return false;
        }
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

if (verifyFormToken())
{
    if (verifyFormData())
    {
        $senderAddr = stripcleantohtml($_POST['email']);

        $message = '';
        $message .= 'Name:    ' . stripcleantohtml($_POST['name']) . "\n";
        $message .= 'Email:   ' . $senderAddr . "\n";
        $message .= 'Message: ' . stripcleantohtml($_POST['message']);

        $emailFrom = 'contact@jakejunker.com';
        $emailTo =   'contact@jakejunker.com';
        $subject =   'Contact Form - ' . $senderAddr;

        $success = @mail($emailTo, $subject, $message, "From: <$emailFrom>");
    }
    else
    {

    }
}
else
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
	header('Location: ' . $protocol . $_SERVER['HTTP_HOST'] . '/contact/');
}
?><!DOCTYPE html>
<html lang="en-US">
	@@include("html/widgets/head.html", {"specialTitle": "Thank You"})@@
	<body>
		@@include("html/widgets/nav-bar.html", {"current": "contact"})@@

		<div id="main-container">
			<section id="main">
				<article id="main-content" data-result="<?php echo $success? 'true' : 'false'; ?>">

					<?php if($success): ?>
                    <h2 class="center-align">Got it!</h2>
                    <p>Thanks for the message! I'll get back to you as soon as I can.</p>

					<?php else: ?>
					<h2 class="center-align">Something broke</h2>
                    <p>Thanks for using the form! Unfortunately, an error occurred on my end, so I suppose I'll need to fix that. Sorry for the inconvenience!</p>
					<?php endif; ?>

				</article>
			</section>
		</div>
		@@include("html/widgets/footer.html")@@
	</body>
</html>