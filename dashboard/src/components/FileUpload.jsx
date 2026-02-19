import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFileUpload }) => {
    const [pendingFiles, setPendingFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setPendingFiles(acceptedFiles);
            onFileUpload(acceptedFiles);
        }
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: true
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">データをアップロード</h1>
                    <p className="text-gray-500 text-sm">
                        売上データ（Excelファイル）をアップロードして<br />ダッシュボードを表示します
                    </p>
                </div>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer ${isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                            📂
                        </div>
                        {isDragActive ? (
                            <p className="text-primary-600 font-medium">ファイルをドロップしてください</p>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-gray-700 font-medium">クリックまたはドラッグ＆ドロップ</p>
                                <p className="text-xs text-gray-400">対応形式: .xlsx, .xls</p>
                                <p className="text-xs text-primary-500 font-medium">複数ファイルを同時に選択できます</p>
                            </div>
                        )}
                    </div>
                </div>

                {pendingFiles.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
                        <p className="text-xs font-semibold text-green-700 mb-1">✅ 読み込み中...</p>
                        <ul className="space-y-1">
                            {pendingFiles.map((f, i) => (
                                <li key={i} className="text-xs text-green-600 flex items-center gap-1">
                                    <span>📄</span>
                                    <span>{f.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-lg text-left">
                    <p className="font-semibold mb-1">💡 ヒント</p>
                    <p>複数年のデータを読み込む場合は、年ごとのファイルを同時に選択してください。前年比などの比較が自動的に計算されます。</p>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
