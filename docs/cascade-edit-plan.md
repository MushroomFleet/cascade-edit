# Cascade-Edit: An MVP Development Guide

## I. Introduction

Cascade-Edit is a real-time text enhancement tool designed for a single-user Windows desktop environment. It leverages the OpenRouter API to provide live grammar, capitalization, and punctuation adjustments to user-written text. This document outlines the most optimal pathway for developing a Minimum Viable Product (MVP) using a React Vite TypeScript stack, packaged for Windows using Tauri.

The core functionality of Cascade-Edit is to take a completed paragraph, identified by a double carriage return, send it to the OpenRouter API for processing, and then stream the corrected paragraph back to the user interface. The corrected text will replace the original paragraph with a visually engaging "character wave" effect. This is all handled in parallel, allowing the user to continue writing uninterrupted while previous paragraphs are being processed.

## II. Core Technologies

*   **Frontend Framework:** React with Vite and TypeScript. This combination provides a fast and modern development experience with the benefits of static typing for improved code quality.
*   **Desktop Application Framework:** Tauri. Tauri is a toolkit for building lightweight and secure desktop applications using web technologies. It's a more modern and performant alternative to Electron.
*   **AI Text Processing:** OpenRouter API. This API will be used for its streaming completion capabilities, allowing for the real-time return of processed text.
*   **Styling:** CSS Modules or a preferred CSS-in-JS library for the "character wave" effect and overall application styling.

## III. Development Pathway

### Step 1: Project Setup with React Vite, TypeScript, and Tauri

1.  **Initialize the Vite Project:** Start by scaffolding a new React project with the TypeScript template.
2.  **Integrate Tauri:** Once the basic React application is running, integrate Tauri into the project. This will allow you to build and package the React application as a native Windows desktop application.

### Step 2: Building the Core Text Editor Interface

1.  **Create a Text Input Component:** Develop a central text area component that will serve as the primary user interface for text entry.
2.  **Detect Paragraph Completion:** Implement logic within the text input component to detect when a user has entered a double carriage return (e.g., by pressing the "Enter" key twice). This can be achieved by monitoring the `onChange` event of the textarea and checking for the `\n\n` character sequence.

### Step 3: Integrating the OpenRouter API

1.  **API Service Module:** Create a dedicated module to handle all interactions with the OpenRouter API. This module will be responsible for sending the paragraph text and receiving the streamed response.
2.  **Streaming Completions:** Utilize the streaming capabilities of the OpenRouter API. When a paragraph is sent for processing, the API will return a stream of text chunks. The application must be able to handle this stream of data as it arrives.

### Step 4: Managing the Live Streaming Queue

1.  **Queue Implementation:** Implement a queueing system to manage paragraphs that are pending processing. When a new paragraph is detected, it should be added to the queue.
2.  **Parallel Processing:** The system should be designed to process multiple paragraphs in parallel. As soon as a paragraph is sent to the OpenRouter API, the system should be ready to send the next one in the queue without waiting for the first one to complete.
3.  **State Management:** Use a state management solution (like React's built-in state or a library like Zustand or Redux Toolkit) to keep track of the status of each paragraph (e.g., `writing`, `processing`, `completed`).

### Step 5: Implementing the "Character Wave" Text Replacement

1.  **Identify the Source Paragraph:** When a paragraph is sent for processing, the application needs to identify and mark the corresponding text block in the user interface. This can be done by wrapping each paragraph in a specific component with a unique identifier.
2.  **Stream-in the New Text:** As the corrected text is streamed back from the OpenRouter API, the application will dynamically update the content of the identified paragraph block.
3.  **"Character Wave" Effect:** To achieve the "character wave" effect, each character of the incoming text can be wrapped in a `<span>` element. A CSS animation can then be applied to these spans with a slight delay for each subsequent character, creating a wave-like appearance as the new paragraph animates in.
4.  **Live Swap:** The implementation should ensure a seamless transition from the original text to the corrected, animated text. The original text will be replaced in real-time as the new text streams in.

## IV. MVP Feature Summary

*   A single-window desktop application for Windows.
*   A text area for users to write and edit text.
*   Automatic detection of completed paragraphs via double carriage returns.
*   Integration with the OpenRouter API for real-time text correction.
*   A live streaming queue for parallel processing of multiple paragraphs.
*   A "character wave" effect for the live replacement of original text with the processed text.