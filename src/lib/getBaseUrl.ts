const getBaseUrl = () =>
	process.env.NODE_ENV === "development"
		? process.env.LOCAL_URL
		: `https://${process.env.VERCEL_URL}`;

export default getBaseUrl;
