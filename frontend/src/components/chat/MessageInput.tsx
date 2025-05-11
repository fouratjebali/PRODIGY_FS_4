import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSmile, faPaperclip, faTimes } from "@fortawesome/free-solid-svg-icons";

interface MessageInputProps {
  onSendMessage: (message: { text: string; files?: File[] }) => void;
  // Add props for typing indicators, etc.
  disabled?: boolean;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const newFiles: File[] = [];
      let alertShown = false;

      for (const file of selectedFiles) {
        if (files.length + newFiles.length >= MAX_FILES) {
          if (!alertShown) alert(`You can select a maximum of ${MAX_FILES} files.`);
          alertShown = true;
          break;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          if (!alertShown) alert(`File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
          alertShown = true;
          continue; // Skip this file
        }
        newFiles.push(file);
      }
      setFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, MAX_FILES));
    }
    // Reset file input to allow selecting the same file again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if ((text.trim() || files.length > 0) && !disabled) {
      onSendMessage({ text: text.trim(), files: files });
      setText("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // Reset height
      }
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="bg-gray-800 p-3 md:p-4 border-t border-gray-700 sticky bottom-0 z-10 select-none">
      {/* Selected files preview */}
      {files.length > 0 && (
        <div className="mb-2 p-2 bg-gray-700 rounded-md flex flex-wrap gap-2 max-h-28 overflow-y-auto custom-scrollbar">
          {files.map((file, index) => (
            <div key={index} className="bg-gray-600 rounded-md p-1.5 flex items-center text-xs text-gray-200 max-w-[150px]">
              <span className="truncate flex-1 mr-1">{file.name}</span>
              <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faTimes} size="sm" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end bg-gray-700 rounded-lg p-1.5">
        <button 
          title="Emoji (not implemented)"
          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors duration-150 focus:outline-none disabled:opacity-50"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faSmile} size="lg" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-3 py-2.5 focus:outline-none text-sm text-white resize-none custom-scrollbar max-h-24 disabled:opacity-50"
          disabled={disabled}
        />
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip" // Example accept types
          disabled={disabled}
        />
        <button 
          title="Attach files"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors duration-150 focus:outline-none disabled:opacity-50"
          disabled={disabled || files.length >= MAX_FILES}
        >
          <FontAwesomeIcon icon={faPaperclip} size="lg" />
        </button>
        <button 
          title="Send message"
          onClick={handleSubmit}
          className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md ml-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || (!text.trim() && files.length === 0)}
        >
          <FontAwesomeIcon icon={faPaperPlane} size="lg" />
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;

