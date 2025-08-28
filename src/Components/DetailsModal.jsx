import React, { useEffect } from "react";
import { BsClipboard2Data } from "react-icons/bs";
import { IoBarChartOutline } from "react-icons/io5";
import { FaFileDownload } from "react-icons/fa";
import { FaShare } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const DetailsModal = ({
    open,
    onClose,
    title,
    description,
    children,
    onPreview,
    onDownload,
    onShare,
    previewActive,
    LEGEND_ITEMS,
}) => {
    
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center  "
            style={{ backgroundColor: "rgba(31, 41, 55, 0.95)" }}
        >
            <div
                className="relative bg-white dark:bg-[#0f172a] rounded-lg shadow-2xl p-8 w-[70vw] max-h-[90vh]  no-scrollbar"
                tabIndex={-1}
            >
                <button
                    className="absolute right-8 top-8 cursor-pointer w-100 flex items-center justify-end gap-3 text-xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    aria-label="Close"
                    onClick={onClose}
                >
                    
                    <IoMdClose size={20} />
                </button>


                <h2 className="text-2xl font-bold mb-2 w-100 text-gray-900 dark:text-white">
                    {title}
                </h2>
                {description && (
                    <p className="mb-4 text-gray-600 dark:text-gray-400">{description}</p>
                )}

                {/* Chart/modal content */}
                <div className="mb-6 hide-scrollbar overflow-y-auto   ">{children}</div>
                {/* Actions */}
                <div className="flex justify-between items-center">
               
                <div className="flex gap-3 mb-2">
                    <button
                        onClick={onPreview}
                        className='bg-gray-200 dark:bg-gray-700 rounded cursor-pointer
  flex px-4 py-2 h-10 hover:bg-gray-300 dark:hover:bg-gray-600 '
                    >
                        {previewActive ? (
                            <>
                                <BsClipboard2Data className="m-1" />
                                <span>Show Chart</span>
                            </>
                        ) : (
                            <>
                                <IoBarChartOutline className="m-1" />
                                <span>Preview Data</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onDownload}
                        className="bg-gray-200 dark:bg-gray-700 flex cursor-pointer  h-10 rounded px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <FaFileDownload className="m-1" /> Download
                    </button>
                    <button
                        onClick={onShare}
                        className="bg-gray-200 dark:bg-gray-700 flex cursor-pointer h-10 rounded px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <FaShare className="m-1" /> Share
                    </button>
                </div>
                {LEGEND_ITEMS && !previewActive && (
                    <div className="flex flex-wrap justify-end  my-2 gap-4  ">
                        {LEGEND_ITEMS.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: item.color }}
                                ></span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
