// Private helpers
// ===============
async function ipCheck() {
	const link = "https://nostalio.lol/app/api/v1/action/ipcheck";
	let res = await fetch(link, { method: "GET" });
	return (await res.json()).result.country;
}

const showInvalidGatewayError = () => {
	loaderElement.classList.add("hide");
	const errorElement = document.querySelector(".error");
	errorElement.classList.remove("hide");
};

const normalizeBase64 = (base64) => {
	const replaceAbleChars = {
		'[PLUS]': '+',
		'[SLASH]': '/',
		'[EQUAL]': '=',
		'[SPACE]': ' ',
	}
	return base64.replace(/\[PLUS\]|\[SLASH\]|\[EQUAL\]|\[SPACE\]/g, (match) => replaceAbleChars[match]);
};

// MAIN
// ====
const loaderElement = document.querySelector(".loading");
const mainArticleElement = document.querySelector(".main-article");
const qrCodeElement = document.getElementById("qrcode");
(async () => {
	try {
		const urlParams = new URLSearchParams(window.location.search);
		const url = urlParams.get("url");
		const post = urlParams.get("post");

		if (!url) return showInvalidGatewayError();

		const paymentGateway = decodeURIComponent(atob(normalizeBase64(url)));
		if (!paymentGateway) return showInvalidGatewayError();
		const validPaymentGateway = post === "yes" ? paymentGateway.startsWith("data:text/html;charset=utf-8") || paymentGateway.startsWith("http") : paymentGateway.startsWith("http");
		if (!validPaymentGateway) return showInvalidGatewayError();

		console.log({ paymentGateway });

		// request to api to check if user is from iran
		const isFromIran = (await ipCheck()) === "IR";

		// if user is from iran, redirect
		if (isFromIran) {
			if (paymentGateway.startsWith("data:text/html;charset=utf-8")) {
				// Redirect to shaparak
				document.body.innerHTML = paymentGateway.replace("data:text/html;charset=utf-8,", "")
				document.frmPay.submit();
			}
			else {
				// Redirect to shaparak
				window.location.href = paymentGateway;
			}
			return;
		}

		// If user isn't from iran, show main-article and create QR Code
		loaderElement.classList.add("hide");
		mainArticleElement.classList.remove("hide");
		qrCodeElement.classList.remove("hide");
		try {
			new QRCode(qrCodeElement, paymentGateway.padEnd(220));
		}
		catch (error) {
			console.warn('QRCode Error:', error);
			qrCodeElement.classList.add("hide");
		}
	} catch (error) {
		console.error(error);
		showInvalidGatewayError();
	}
})();
