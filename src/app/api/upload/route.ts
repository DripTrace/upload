import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		return NextResponse.json(
			{ error: "No file uploaded" },
			{ status: 400 }
		);
	}

	if (file.size > 5 * 1024 * 1024) {
		return NextResponse.json(
			{ error: "File size exceeds 5MB limit" },
			{ status: 400 }
		);
	}

	try {
		// Call third-party API when upload begins
		await fetch("https://jsonplaceholder.typicode.com/posts", {
			method: "POST",
			body: JSON.stringify({ title: "Upload Start", body: file.name }),
			headers: { "Content-type": "application/json; charset=UTF-8" },
		});

		const blob = await put(file.name, file, {
			access: "public",
		});

		// Call third-party API when upload succeeds
		await fetch("https://jsonplaceholder.typicode.com/posts", {
			method: "POST",
			body: JSON.stringify({ title: "Upload Success", body: blob.url }),
			headers: { "Content-type": "application/json; charset=UTF-8" },
		});

		return NextResponse.json({ url: blob.url });
	} catch (error: unknown) {
		// Call third-party API when upload fails
		let errorMessage = "An unknown error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		}

		await fetch("https://jsonplaceholder.typicode.com/posts", {
			method: "POST",
			body: JSON.stringify({ title: "Upload Fail", body: errorMessage }),
			headers: { "Content-type": "application/json; charset=UTF-8" },
		});

		console.error("File upload failed:", errorMessage);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
