"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pencil, Trash } from "lucide-react";
import { deleteFile, renameFile, uploadFile } from "@/actions/fileHandle";

// Client Component
const FileUpload = () => {
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showSizeModal, setShowSizeModal] = useState(false);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [fileToRename, setFileToRename] = useState<UploadedFile | null>(null);
	const [newFileName, setNewFileName] = useState("");

	const router = useRouter();

	useEffect(() => {
		const storedFiles = localStorage.getItem("uploadedFiles");
		if (storedFiles) {
			setFiles(JSON.parse(storedFiles));
		}
		// Simulate loading delay
		setTimeout(() => setIsLoading(false), 1000);
	}, []);

	useEffect(() => {
		localStorage.setItem("uploadedFiles", JSON.stringify(files));
	}, [files]);

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setShowSizeModal(true);
			return;
		}

		setIsUploading(true);
		setError(null);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const url = await uploadFile(formData);
			setFiles((prevFiles) => [
				...prevFiles,
				{ url, pathname: file.name },
			]);
		} catch (err) {
			setError("Failed to upload file. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDelete = async (file: UploadedFile) => {
		try {
			await deleteFile(file.pathname);
			setFiles((prevFiles) =>
				prevFiles.filter((f) => f.url !== file.url)
			);
		} catch (err) {
			setError("Failed to delete file. Please try again.");
		}
	};

	const handleRename = (file: UploadedFile) => {
		setFileToRename(file);
		setNewFileName(file.pathname);
		setShowRenameModal(true);
	};

	const confirmRename = async () => {
		if (!fileToRename) return;

		try {
			const result = await renameFile(fileToRename.pathname, newFileName);
			if (result.success) {
				setFiles((prevFiles) =>
					prevFiles.map((f) =>
						f.url === fileToRename.url
							? { ...f, pathname: newFileName }
							: f
					)
				);
			}
		} catch (err) {
			setError("Failed to rename file. Please try again.");
		} finally {
			setShowRenameModal(false);
			setFileToRename(null);
		}
	};

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="p-4">
			<input
				type="file"
				onChange={handleFileUpload}
				className="hidden"
				id="fileInput"
				disabled={isUploading}
			/>
			<Button asChild>
				<label htmlFor="fileInput">
					{isUploading ? "Uploading..." : "Upload File"}
				</label>
			</Button>

			{isLoading ? (
				<div className="mt-4 space-y-2">
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className="h-8 bg-gray-200 animate-pulse rounded"
						></div>
					))}
				</div>
			) : (
				<ul className="mt-4 space-y-2">
					{files.map((file, index) => (
						<li
							key={index}
							className="flex items-center justify-between"
						>
							<a
								href={file.url}
								download
								className="text-blue-500 hover:underline"
							>
								{file.pathname}
							</a>
							<div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleRename(file)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleDelete(file)}
								>
									<Trash className="h-4 w-4" />
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}

			<Dialog open={showSizeModal} onOpenChange={setShowSizeModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>File Too Large</DialogTitle>
					</DialogHeader>
					<p>
						The selected file exceeds the 5MB limit. Please choose a
						smaller file.
					</p>
					<DialogFooter>
						<Button onClick={() => setShowSizeModal(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename File</DialogTitle>
					</DialogHeader>
					<Input
						value={newFileName}
						onChange={(e) => setNewFileName(e.target.value)}
						placeholder="New file name"
					/>
					<DialogFooter>
						<Button onClick={() => setShowRenameModal(false)}>
							Cancel
						</Button>
						<Button onClick={confirmRename}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default FileUpload;
