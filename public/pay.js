class TwetchPay {
	init() {
		this.origin = 'https://twetch-pay.now.sh';
		this.iframe = document.createElement('iframe');
		this.iframe.style.border = 'none';
		this.iframe.style.overflow = 'hidden';
		this.iframe.style.width = '0px';
		this.iframe.style.height = '0px';
		this.iframe.style.position = 'fixed';
		this.iframe.style.top = 0;
		this.iframe.style.left = 0;
		this.iframe.setAttribute('src', this.origin);
		document.body.appendChild(this.iframe);
	}

	displayIframe() {
		this.iframe.style.height = '100vh';
		this.iframe.style.width = '100vw';
	}

	hideIframe() {
		this.iframe.style.width = '0px';
		this.iframe.style.height = '0px';
	}

	async pay(props) {
		let onCryptoOperations;

		if (props.moneybuttonProps && props.moneybuttonProps.onCryptoOperations) {
			onCryptoOperations = props.moneybuttonProps.onCryptoOperations;
			delete props.moneybuttonProps.onCryptoOperations;
		}

		this.iframe.contentWindow.postMessage({ from: 'twetch-pay', props }, this.origin);
		this.displayIframe();

		return new Promise((resolve, reject) => {
			window.addEventListener('message', event => {
				const data = event.data;

				if (data && typeof data === 'object' && data.action) {
					const action = {
						closeTwetchPay: () => {
							this.hideIframe();
							return resolve();
						},
						paymentTwetchPay: () => {
							this.hideIframe();
							return resolve(data.payment);
						},
						errorTwetchPay: () => {
							this.hideIframe();
							return reject(data.error);
						},
						cryptoOperationsTwetchPay: () => {
							this.hideIframe();
							return onCryptoOperations && onCryptoOperations(data.cryptoOperations);
						}
					}[data.action];

					action();
				}
			});
		});
	}
}

const twetchPay = new TwetchPay();

window.addEventListener('load', function() {
	twetchPay.init();
});

window.twetchPay = twetchPay;
