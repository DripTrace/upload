"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
import { Pencil, Trash, Download, Eye, HelpCircle } from "lucide-react";
import {
	deleteFile,
	renameFile,
	uploadFile,
	listFiles,
	UploadedFile,
} from "@/actions/fileHandle";
import Image from "next/image";

const DynamicFileViewer = dynamic(() => import("./DynamicFileViewer"), {
	ssr: false,
});
const DynamicJoyride = dynamic(
	() => import("react-joyride").then((mod) => mod.default),
	{ ssr: false }
);

const SkeletonLoader = () => (
	<div className="space-y-2">
		{[...Array(3)].map((_, i) => (
			<div
				key={i}
				className="h-12 bg-gray-200 rounded animate-pulse"
			></div>
		))}
	</div>
);

const DynamicFileUpload: React.FC = () => {
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showSizeModal, setShowSizeModal] = useState(false);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [fileToRename, setFileToRename] = useState<UploadedFile | null>(null);
	const [newFileName, setNewFileName] = useState("");
	const [viewerOpen, setViewerOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
	const [runTutorial, setRunTutorial] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const [steps] = useState([
		{
			target: ".file-manager-title",
			content:
				"Welcome to the Funky File Manager! This tutorial will guide you through the main features.",
			disableBeacon: true,
		},
		{
			target: ".upload-button",
			content:
				"Click here to upload a new file. You can upload files up to 5MB in size.",
		},
		{
			target: ".file-list",
			content:
				"Your uploaded files will appear here. You can view, download, rename, or delete them.",
		},
		{
			target: ".file-actions",
			content:
				"Use these buttons to interact with your files. From left to right: View, Download, Rename, and Delete.",
		},
		{
			target: ".tutorial-button",
			content:
				"You can replay this tutorial anytime by clicking this button.",
		},
	]);

	useEffect(() => {
		setIsMounted(true);
		const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
		if (!hasSeenTutorial) {
			setRunTutorial(true);
			localStorage.setItem("hasSeenTutorial", "true");
		}

		const fetchFiles = async () => {
			try {
				const fetchedFiles = await listFiles();
				setFiles(fetchedFiles);
			} catch (err) {
				setError("Failed to fetch files. Please refresh the page.");
			} finally {
				setTimeout(() => setIsLoading(false), 1000); // Simulate loading delay
			}
		};

		fetchFiles();
	}, []);

	const handleJoyrideCallback = (data: any) => {
		const { status, type } = data;
		if (["finished", "skipped"].includes(status) || type === "tour:end") {
			setRunTutorial(false);
		}
	};

	useEffect(() => {
		const fetchFiles = async () => {
			try {
				const fetchedFiles = await listFiles();
				setFiles(fetchedFiles);
			} catch (err) {
				setError("Failed to fetch files. Please refresh the page.");
			} finally {
				setTimeout(() => setIsLoading(false), 1000); // Simulate loading delay
			}
		};

		fetchFiles();
	}, []);

	const handleDynamicFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setShowSizeModal(true);
			event.target.value = ""; // Reset file input
			return;
		}

		setIsUploading(true);
		setError(null);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const uploadedFile = await uploadFile(formData);
			setFiles((prevFiles) => [...prevFiles, uploadedFile]);
		} catch (err) {
			setError("Failed to upload file. Please try again.");
		} finally {
			setIsUploading(false);
			event.target.value = ""; // Reset file input
		}
	};

	const handleDelete = async (file: UploadedFile) => {
		setIsDeleting(true);
		try {
			await deleteFile(file.url);
			setFiles((prevFiles) =>
				prevFiles.filter((f) => f.url !== file.url)
			);
			setError(null); // Clear any previous errors
		} catch (err) {
			setError(
				`Failed to delete file: ${
					err instanceof Error ? err.message : "Unknown error"
				}`
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRename = (file: UploadedFile) => {
		setFileToRename(file);
		const fileName = file.pathname.split("/").pop() || "";
		const fileNameWithoutExtension = fileName
			.split(".")
			.slice(0, -1)
			.join(".");
		setNewFileName(fileNameWithoutExtension);
		setShowRenameModal(true);
	};

	const confirmRename = async () => {
		if (!fileToRename || !newFileName.trim()) return;

		setIsRenaming(true);
		setError(null);
		try {
			const renamedFile = await renameFile(
				fileToRename.url,
				newFileName.trim()
			);
			setFiles((prevFiles) =>
				prevFiles.map((f) =>
					f.url === fileToRename.url ? renamedFile : f
				)
			);
		} catch (err) {
			setError(
				`Failed to rename file: ${
					err instanceof Error ? err.message : "Unknown error"
				}`
			);
			console.error(err);
		} finally {
			setIsRenaming(false);
			setShowRenameModal(false);
			setFileToRename(null);
			setNewFileName("");
		}
	};

	const handleViewFile = (file: UploadedFile) => {
		setSelectedFile(file);
		setViewerOpen(true);
	};

	const renderContent = () => {
		if (!isMounted) {
			return <SkeletonLoader />;
		}

		if (isLoading) {
			return <SkeletonLoader />;
		}

		return (
			<ul className="space-y-2 file-list">
				{files.map((file) => (
					<li
						key={file.url}
						className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
					>
						<span className="text-sm truncate max-w-[200px] rainbow-text">
							{decodeURIComponent(
								file.pathname.split("/").pop() || ""
							)}
						</span>
						<div className="flex space-x-2 file-actions">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleViewFile(file)}
							>
								<Eye className="h-4 w-4 rainbow-text" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => window.open(file.url, "_blank")}
							>
								<Download className="h-4 w-4 rainbow-text" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleRename(file)}
								disabled={isRenaming}
							>
								<Pencil className="h-4 w-4 rainbow-text" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleDelete(file)}
								disabled={isDeleting}
							>
								<Trash className="h-4 w-4 rainbow-text" />
							</Button>
						</div>
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className="flex justify-center items-start min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
			<div className="w-full max-w-2xl bg-white bg-opacity-90 rounded-lg shadow-xl p-6">
				<div className="text-3xl font-bold mb-4 text-center rainbow-text file-manager-title flex items-center justify-center">
					<Image
						src="/funkyfilemanagerlogo.svg"
						alt="Funky File Manager"
						width={55}
						height={55}
					/>
					Funky File Manager
				</div>

				{isMounted && (
					<div className="flex justify-between items-center mb-6">
						<Button
							onClick={() =>
								document.getElementById("fileInput")?.click()
							}
							disabled={isUploading}
							className="bg-purple-600 text-white hover:bg-purple-700 upload-button"
						>
							{isUploading ? "Uploading..." : "Upload File"}
						</Button>
						<input
							title="Upload File"
							type="file"
							id="fileInput"
							className="hidden"
							onChange={handleDynamicFileUpload}
							disabled={isUploading}
						/>
						<Button
							onClick={() => setRunTutorial(true)}
							className="bg-blue-500 text-white hover:bg-blue-600 tutorial-button"
						>
							<HelpCircle className="h-4 w-4 mr-2" />
							Tutorial
						</Button>
					</div>
				)}

				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{renderContent()}

				{isMounted && (
					<>
						<Dialog
							open={showSizeModal}
							onOpenChange={setShowSizeModal}
						>
							<DialogContent className="modal-content">
								<DialogHeader>
									<DialogTitle className="rainbow-text">
										File Too Large
									</DialogTitle>
								</DialogHeader>
								<p className="rainbow-text">
									The selected file exceeds the 5MB limit.
									Please choose a smaller file.
								</p>
								<DialogFooter>
									<Button
										onClick={() => setShowSizeModal(false)}
										className="rainbow-text"
									>
										Close
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog
							open={showRenameModal}
							onOpenChange={setShowRenameModal}
						>
							<DialogContent className="modal-content">
								<DialogHeader>
									<DialogTitle className="rainbow-text">
										Rename File
									</DialogTitle>
								</DialogHeader>
								<Input
									value={newFileName}
									onChange={(e) =>
										setNewFileName(e.target.value)
									}
									placeholder="New file name"
									disabled={isRenaming}
									className="rainbow-text"
								/>
								<DialogFooter>
									<Button
										onClick={() =>
											setShowRenameModal(false)
										}
										disabled={isRenaming}
										className="rainbow-text"
									>
										Cancel
									</Button>
									<Button
										onClick={confirmRename}
										disabled={
											!newFileName.trim() || isRenaming
										}
										className="rainbow-text"
									>
										{isRenaming ? "Renaming..." : "Save"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
							<DialogContent className="modal-content max-w-4xl">
								<DialogHeader>
									<DialogTitle className="rainbow-text">
										File Viewer
									</DialogTitle>
								</DialogHeader>
								{selectedFile && (
									<DynamicFileViewer file={selectedFile} />
								)}
								<DialogFooter>
									<Button
										onClick={() => setViewerOpen(false)}
										className="rainbow-text"
									>
										Close
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<DynamicJoyride
							steps={steps}
							run={runTutorial}
							continuous
							showSkipButton
							showProgress
							styles={{
								options: {
									arrowColor: "#ffffff",
									backgroundColor: "#ffffff",
									overlayColor: "rgba(0, 0, 0, 0.5)",
									primaryColor: "#7c3aed",
									textColor: "#333333",
									zIndex: 1000,
								},
							}}
							callback={handleJoyrideCallback}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default DynamicFileUpload;
