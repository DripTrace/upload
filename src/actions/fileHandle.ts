"use server";

import { put, del, list } from "@vercel/blob";

export type UploadedFile = {
	url: string;
	pathname: string;
};

type FactType = "cat" | "advice" | "chuck" | "dog" | "affirmation" | "kanye";

export async function uploadFile(formData: FormData): Promise<UploadedFile> {
	const file = formData.get("file") as File;
	if (!file) {
		throw new Error("No file uploaded");
	}

	if (file.size > 5 * 1024 * 1024) {
		throw new Error("File size exceeds 5MB limit");
	}

	try {
		const blob = await put(file.name, file, {
			access: "public",
			addRandomSuffix: true,
		});
		return { url: blob.url, pathname: blob.pathname };
	} catch (error) {
		console.error("Error uploading file:", error);
		throw new Error("Failed to upload file");
	}
}

export async function renameFile(
	oldUrl: string,
	newName: string
): Promise<UploadedFile> {
	try {
		const response = await fetch(oldUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch original file: ${response.statusText}`
			);
		}
		const blobContent = await response.blob();

		const fileExtension = oldUrl.split(".").pop();
		const newNameWithExtension = newName.includes(".")
			? newName
			: `${newName}.${fileExtension}`;

		const newBlob = await put(newNameWithExtension, blobContent, {
			access: "public",
		});

		await del(oldUrl);

		return { url: newBlob.url, pathname: newBlob.pathname };
	} catch (error) {
		console.error("Error renaming file:", error);
		throw new Error(
			`Failed to rename file: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}

export async function deleteFile(url: string): Promise<void> {
	try {
		await del(url);
	} catch (error) {
		console.error("Error deleting file:", error);
		throw new Error(
			`Failed to delete file: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}

export async function listFiles(): Promise<UploadedFile[]> {
	try {
		const { blobs } = await list();
		return blobs.map((blob) => ({
			url: blob.url,
			pathname: blob.pathname,
		}));
	} catch (error) {
		console.error("Error listing files:", error);
		throw new Error("Failed to list files");
	}
}

export async function fetchFact(type: FactType): Promise<string> {
	try {
		let url: string;
		switch (type) {
			case "cat":
				url = "https://catfact.ninja/fact";
				const catResponse = await fetch(url);
				const catData = await catResponse.json();
				return catData.fact;
			case "advice":
				url = "https://api.adviceslip.com/advice";
				const adviceResponse = await fetch(url);
				const adviceData = await adviceResponse.json();
				return adviceData.slip.advice;
			case "chuck":
				url = "https://api.chucknorris.io/jokes/random";
				const chuckResponse = await fetch(url);
				const chuckData = await chuckResponse.json();
				return chuckData.value;
			case "dog":
				url = "https://dog.ceo/api/breeds/image/random";
				const dogResponse = await fetch(url);
				const dogData = await dogResponse.json();
				return dogData.message;
			case "affirmation":
				url = "https://www.affirmations.dev/";
				const affirmationResponse = await fetch(url);
				const affirmationData = await affirmationResponse.json();
				return affirmationData.affirmation;
			case "kanye":
				url = "https://api.kanye.rest/";
				const kanyeResponse = await fetch(url);
				const kanyeData = await kanyeResponse.json();
				return kanyeData.quote;
			default:
				throw new Error("Invalid fact type");
		}
	} catch (error) {
		console.error(`Error fetching ${type} fact:`, error);
		throw new Error(`Failed to fetch ${type} fact`);
	}
}
