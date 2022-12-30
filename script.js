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

// MAIN
// ====
const loaderElement = document.querySelector(".loading");
const mainArticleElement = document.querySelector(".main-article");
const qrCodeElement = document.getElementById("qrcode");
(async () => {
	try {
		const urlParams = new URLSearchParams(window.location.search);
		const url = urlParams.get("url");

		if (!url) return showInvalidGatewayError();

		const paymentGateway = decodeURIComponent(atob(url));
		if (!paymentGateway.startsWith("http") || !paymentGateway) return showInvalidGatewayError();

		console.log({ paymentGateway });

		// request to api to check if user is from iran
		const isFromIran = (await ipCheck()) === "IR";

		// if user is from iran, redirect
		if (isFromIran) {
			// Redirect to shaparak
			window.location.href = paymentGateway;
			return;
		}

		// If user isn't from iran, show main-article and create QR Code
		loaderElement.classList.add("hide");
		mainArticleElement.classList.remove("hide");
		qrCodeElement.classList.remove("hide");
		new QRCode(qrCodeElement, paymentGateway);
	} catch (error) {
		console.error(error);
		showInvalidGatewayError();
	}
})();
