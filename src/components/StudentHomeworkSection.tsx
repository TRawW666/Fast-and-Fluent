import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Paperclip,
  X,
  FileCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HomeworkSubmission } from '../types';

interface ClassHomeworkSectionProps {
  studentId: string;
  courseName: string;
  classId: string;
}

export const ClassHomeworkSection: React.FC<ClassHomeworkSectionProps> = ({
  studentId,
  courseName,
  classId,
}) => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // In-app delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<HomeworkSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('student_id', studentId)
        .eq('course_name', courseName)
        .eq('class_id', classId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching homework submissions:', error);
      } else {
        setSubmissions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading homework submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && courseName && classId) {
      fetchSubmissions();
    }
  }, [studentId, courseName, classId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileArray: File[] = Array.from(files);

    // Validate all selected files
    for (const file of fileArray) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isAllowedType =
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'application/pdf' ||
        allowedExtensions.includes(ext);

      if (!isAllowedType) {
        setErrorMessage(
          `Invalid file format for "${file.name}". Only JPG, PNG, and PDF files are allowed.`
        );
        e.target.value = '';
        return;
      }
    }

    setUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`);

        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const filePath = `${studentId}/${courseName}/${timestamp}-${cleanFileName}`;

        // 1. Upload to Supabase Storage bucket 'homework'
        const { error: storageErr } = await supabase.storage
          .from('homework')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (storageErr) {
          console.error(`Storage upload error for ${file.name}:`, storageErr);
          throw new Error(`Failed to upload file "${file.name}": ${storageErr.message}`);
        }

        // 2. Insert record into 'homework_submissions' table
        const { error: dbErr } = await supabase.from('homework_submissions').insert([
          {
            student_id: studentId,
            course_name: courseName,
            class_id: classId,
            file_path: filePath,
            file_name: file.name,
            file_type: file.type || 'application/octet-stream',
          },
        ]);

        if (dbErr) {
          console.error(`Database insert error for ${file.name}:`, dbErr);
          await supabase.storage.from('homework').remove([filePath]);
          throw new Error(`Failed to save record for "${file.name}": ${dbErr.message}`);
        }

        successCount++;
      }

      setSuccessMessage(
        `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}!`
      );
      await fetchSubmissions();
    } catch (err: any) {
      console.error('Homework upload failed:', err);
      setErrorMessage(err.message || 'An error occurred while uploading homework.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleOpenSignedUrl = async (filePath: string) => {
    const fileWindow = window.open('about:blank', '_blank');
    try {
      const { data, error } = await supabase.storage
        .from('homework')
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) {
        fileWindow?.close();
        console.error('Error generating signed URL:', error);
        alert('Failed to generate secure link to view file.');
        return;
      }

      if (fileWindow) {
        fileWindow.location.href = data.signedUrl;
      } else {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      fileWindow?.close();
      console.error('Unexpected error viewing file:', err);
      alert('An error occurred while trying to open the file.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);

    try {
      const { error: storageErr } = await supabase.storage
        .from('homework')
        .remove([fileToDelete.file_path]);

      if (storageErr) {
        console.warn('Storage deletion warning:', storageErr);
      }

      const { error: dbErr } = await supabase
        .from('homework_submissions')
        .delete()
        .eq('id', fileToDelete.id);

      if (dbErr) {
        console.error('Database deletion error:', dbErr);
        setErrorMessage('Failed to delete homework submission record.');
      } else {
        setSuccessMessage(`Deleted "${fileToDelete.file_name}".`);
        setSubmissions((prev) => prev.filter((s) => s.id !== fileToDelete.id));
      }
    } catch (err) {
      console.error('Error during file deletion:', err);
      setErrorMessage('An unexpected error occurred while deleting the file.');
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const isImage =
      fileType.startsWith('image/') ||
      /\.(jpg|jpeg|png)$/i.test(fileName);
    if (isImage) {
      return <ImageIcon className="w-3.5 h-3.5 text-blue-600" />;
    }
    return <FileText className="w-3.5 h-3.5 text-red-600" />;
  };

  return (
    <div className="w-full pt-3 mt-3 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
          <FileCheck className="w-3.5 h-3.5 text-[#1E40AF]" />
          <span>Class Homework Submissions:</span>
        </div>

        {/* Compact Upload Button */}
        <label className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer self-start sm:self-auto">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-300" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5 text-yellow-300" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Homework'}</span>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Progress & Feedback Banners */}
      {uploadProgress && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-[#1E40AF] flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#1E40AF]" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-500 hover:text-green-800 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* List of Uploaded Files for this class */}
      {loading ? (
        <div className="py-2 text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E40AF]" />
          <span>Loading homework...</span>
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium italic">
          No homework submitted yet.
        </p>
      ) : (
        <div className="space-y-1.5">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-white border border-slate-200 shrink-0">
                  {getFileIcon(item.file_name, item.file_type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate" title={item.file_name}>
                    {item.file_name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Uploaded{' '}
                    {new Date(item.uploaded_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenSignedUrl(item.file_path)}
                  className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-[#1E40AF] font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  title="View / Download file"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFileToDelete(item)}
                  className="p-1 rounded bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Delete file"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom In-App Modal for Delete Confirmation */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Delete Homework Submission?</h3>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
              Are you sure you want to delete <strong className="text-slate-900">"{fileToDelete.file_name}"</strong>? This will permanently remove the file from your submissions.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const StudentHomeworkSection = ClassHomeworkSection;
