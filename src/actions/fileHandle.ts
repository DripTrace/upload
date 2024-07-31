"use server";

import { put, del, list, PutBlobResult } from "@vercel/blob";

export type UploadedFile = PutBlobResult & { todoTitle?: string };

async function getTodo() {
	const response = await fetch(
		"https://jsonplaceholder.typicode.com/todos/1"
	);
	const data = await response.json();
	return data.title;
}

export async function uploadFile(formData: FormData): Promise<UploadedFile> {
	const file = formData.get("file") as File;
	if (!file) {
		throw new Error("No file uploaded");
	}

	try {
		const blob = await put(file.name, file, {
			access: "public",
			addRandomSuffix: true,
			cacheControlMaxAge: 60 * 60 * 24, // 1 day
		});
		const todoTitle = await getTodo();
		return { ...blob, todoTitle };
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
			addRandomSuffix: true,
			cacheControlMaxAge: 60 * 60 * 24, // 1 day
		});

		await del(oldUrl);

		return newBlob;
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
			...blob,
			contentDisposition: `attachment; filename="${blob.pathname
				.split("/")
				.pop()}"`,
		}));
	} catch (error) {
		console.error("Error listing files:", error);
		throw new Error("Failed to list files");
	}
}
