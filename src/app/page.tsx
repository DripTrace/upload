import dynamic from "next/dynamic";

const DynamicFileUpload = dynamic(
	() => import("../components/DynamicFileUpload"),
	{ ssr: false }
);

export default function Home() {
	return (
		<main className="">
			<DynamicFileUpload />
		</main>
	);
}
