"use client";

import useUpload, { StatusText } from "@/hooks/useUpload";
import { CheckCircleIcon, CircleArrowDown, HammerIcon, RocketIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { JSX, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

function FileUploader() {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);
  const statusIcons: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]: <RocketIcon className="w-20 h-20 text-blue-600" />,
    [StatusText.UPLOADED]: <CheckCircleIcon className="w-20 h-20 text-blue-600" />,
    [StatusText.SAVING]: <SaveIcon className="w-20 h-20 text-blue-600" />,
    [StatusText.GENERATING]: <HammerIcon className="w-20 h-20 text-blue-600" />,

  };
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      await handleUpload(file);
    } else {
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,

      accept: { "application/pdf": [".pdf"] },
    });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className=" flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-blue-300 text-white border-blue-600 border-4 ${
              progress === 100 && "hidden"
            }`}
            role="progressbar"
            style={{
              // @ts-ignore
              "--value": progress,
              "--size": "12rem",
              "--thickness": "1.3rem",
            }}
          >
            {progress} %
          </div>
          {
            //@ts-ignore
            statusIcons[status!]
          }
          <p className="text-indigo-600 animate-pulse">
            {/* @ts-ignore */}
            {status}
          </p>
        </div>
      )}
     {!uploadInProgress && ( <div
        {...getRootProps()}
        className={`p-10 border-2 justify-center rounded-lg h-96 flex items-center  border-dashed mt-10 w-[90%]  border-blue-600 text-blue-600
        ${isFocused || isDragAccept ? "bg-blue-300" : "bg-blue-100"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col justify-center items-center text-center">
          {isDragActive ? (
            <>
              <RocketIcon className="h-20 w-20 animate-ping" />
              <p>Drop the files here ...</p>
            </>
          ) : (
            <>
              <CircleArrowDown className="h-20 w-20 animate-bounce" />
              <p>
                Drag &apos;n&apos; drop some files here, or click to select
                files
              </p>
            </>
          )}
        </div>
      </div>)}
    </div>
  );
}

export default FileUploader;
