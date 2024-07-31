import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html lang="en" className="">
				<Head>
					<link rel="icon" href="/favicon.ico" sizes="any" />
				</Head>
				<Main />
				<NextScript />
			</Html>
		);
	}
}

export default MyDocument;
