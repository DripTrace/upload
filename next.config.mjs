/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "upload-pi-ten.vercel.app",
			},
			{
				protocol: "https",
				hostname: "zn7idqbjkclvrjkv.public.blob.vercel-storage.com",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
				],
			},
		];
	},
};

export default nextConfig;
