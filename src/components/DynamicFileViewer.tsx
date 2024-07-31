import React, { useState, useEffect } from "react";
import Image from "next/image";
import { UploadedFile } from "@/actions/fileHandle";

interface DynamicFileViewerProps {
	file: UploadedFile;
}

const DynamicFileViewer: React.FC<DynamicFileViewerProps> = ({ file }) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null; // or a loading indicator
	}

	const fileExtension = file.pathname.split(".").pop()?.toLowerCase();

	switch (fileExtension) {
		case "pdf":
			return (
				<iframe
					src={file.url}
					width="100%"
					height="600px"
					title={`PDF: ${file.pathname}`}
				/>
			);
		case "mp4":
			return <video src={file.url} controls width="100%" />;
		case "mp3":
			return <audio src={file.url} controls />;
		case "png":
		case "jpg":
		case "jpeg":
		case "gif":
			return (
				<div
					style={{
						position: "relative",
						width: "100%",
						height: "600px",
					}}
				>
					<Image
						src={file.url}
						alt={file.pathname}
						layout="fill"
						objectFit="contain"
					/>
				</div>
			);
		case "svg":
			return (
				<object
					data={file.url}
					type="image/svg+xml"
					style={{ maxWidth: "100%", maxHeight: "600px" }}
					aria-label={`SVG: ${file.pathname}`}
				/>
			);
		case "md":
			return (
				<iframe
					src={`https://marked.js.org/web/viewer.html?url=${encodeURIComponent(
						file.url
					)}`}
					width="100%"
					height="600px"
					title={`Markdown: ${file.pathname}`}
				/>
			);
		default:
			return (
				<p>
					Preview not available for this file type.{" "}
					<a
						href={file.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						Download
					</a>{" "}
					to view.
				</p>
			);
	}
};

export default DynamicFileViewer;
