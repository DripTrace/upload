# Funky File Manager Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Components](#components)
    - [FileUpload](#fileupload)
    - [FileViewer](#fileviewer)
7. [Server Actions](#server-actions)
8. [Styling](#styling)
9. [Tutorial System](#tutorial-system)
10. [Error Handling](#error-handling)
11. [Performance Considerations](#performance-considerations)
12. [Accessibility](#accessibility)
13. [Future Enhancements](#future-enhancements)

## 1. Introduction

The Funky File Manager is a vibrant and user-friendly web application built with Next.js, React, and TypeScript. It provides an intuitive interface for users to upload, view, rename, and delete files, with a playful design and interactive tutorial.

## 2. Features

-   File upload (up to 5MB)
-   File listing with animated UI
-   File preview for various file types
-   File renaming
-   File deletion
-   Interactive tutorial for new users
-   Responsive design
-   Animated rainbow text for a fun user experience

## 3. Project Structure

```
funky-file-manager/
│
├── src/
│   ├── app/
│   │   └── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/...shad-cn components
│   │   ├── DynamicFileUpload.tsx
│   │   └── DynamicFileViewer.tsx
│   ├── actions/
│   │   └── fileHandle.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── fileUpload.d.ts
├── public/
├── package.json
├── next.config.mjs
└── ...other configs
```

## 4. Installation

1. Clone the repository:

    ```
    git clone https://github.com/DripTrace/upload.git
    ```

2. Navigate to the project directory:

    ```
    cd upload
    ```

3. Install dependencies:

    ```
    yarn
    ```

4. Set up environment variables:
   Create a `.env.local` file in the root directory and add:

    ```
    NEXT_PUBLIC_VERCEL_BLOB_STORE_URL=your-vercel-blob-store-url
    ```

5. Run the development server:
    ```
    yarn run dev
    ```

## 5. Usage

Open your browser and navigate to `http://localhost:3000`. You'll be greeted with the Funky File Manager interface. New users will see an interactive tutorial guiding them through the application's features.

## 6. Components

### FileUpload

The main component of the application, handling file operations and UI rendering.

Key features:

-   File upload button
-   File listing
-   Rename and delete operations
-   Tutorial trigger
-   Error handling

### FileViewer

A dynamic component for previewing different file types.

Supported file types:

-   PDF
-   Images (PNG, JPG, JPEG, GIF)
-   Audio (MP3)
-   Video (MP4)
-   Markdown
-   SVG

## 7. Server Actions

Located in `src/actions/fileHandle.ts`, these functions handle server-side operations:

-   `uploadFile`: Handles file upload to Vercel Blob storage
-   `renameFile`: Renames a file in Vercel Blob storage
-   `deleteFile`: Deletes a file from Vercel Blob storage
-   `listFiles`: Retrieves the list of files from Vercel Blob storage

## 8. Styling

The project uses a combination of Tailwind CSS and custom CSS for styling. The rainbow text effect and animations are defined in `src/styles/globals.css`.

## 9. Tutorial System

The tutorial is implemented using `react-joyride`. It guides new users through the application's features with step-by-step instructions.

## 10. Error Handling

Errors are displayed using the Alert component from your UI library. File operations have try-catch blocks to handle and display errors gracefully.

## 11. Performance Considerations

-   Dynamic imports are used for heavy components to improve initial load time
-   The FileViewer component is loaded dynamically to reduce the initial bundle size
-   Server-side rendering is disabled for components that could cause hydration mismatches

## 12. Accessibility

-   Proper labeling for buttons and inputs
-   Keyboard navigation support
-   ARIA attributes for better screen reader support

## 13. Future Enhancements

-   Implement file search functionality
-   Add drag-and-drop file upload
-   Introduce file categorization or tagging system
-   Implement file sharing features
-   Add user authentication and personal file spaces

---

This documentation provides an overview of the Funky File Manager project. For more detailed information about specific functions or components, refer to the inline comments in the source code.
