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

interface StudentHomeworkSectionProps {
  studentId: string;
  courseName: string;
}

export const StudentHomeworkSection: React.FC<StudentHomeworkSectionProps> = ({
  studentId,
  courseName,
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
    fetchSubmissions();
  }, [studentId, courseName]);

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
            file_path: filePath,
            file_name: file.name,
            file_type: file.type || 'application/octet-stream',
          },
        ]);

        if (dbErr) {
          console.error(`Database insert error for ${file.name}:`, dbErr);
          // Cleanup uploaded file from storage if DB insert failed
          await supabase.storage.from('homework').remove([filePath]);
          throw new Error(`Failed to save record for "${file.name}": ${dbErr.message}`);
        }

        successCount++;
      }

      setSuccessMessage(
        `Successfully uploaded ${successCount} homework file${successCount > 1 ? 's' : ''}!`
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
    try {
      const { data, error } = await supabase.storage
        .from('homework')
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) {
        console.error('Error generating signed URL:', error);
        alert('Failed to generate secure link to view file.');
        return;
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Unexpected error viewing file:', err);
      alert('An error occurred while trying to open the file.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Remove from Storage
      const { error: storageErr } = await supabase.storage
        .from('homework')
        .remove([fileToDelete.file_path]);

      if (storageErr) {
        console.warn('Storage deletion warning:', storageErr);
      }

      // 2. Delete row from homework_submissions
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
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    }
    return <FileText className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="mt-6 pt-5 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#1E40AF]" />
            <span>My Homework & Assignments</span>
          </h4>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Upload your completed worksheets or practice documents (JPG, PNG, PDF) for teacher review.
          </p>
        </div>

        {/* Upload Button */}
        <label className="relative self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
          ) : (
            <UploadCloud className="w-4 h-4 text-yellow-300" />
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
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-[#1E40AF] flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#1E40AF]" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-500 hover:text-green-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* List of Uploaded Files */}
      {loading ? (
        <div className="py-4 text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
          <span>Loading homework files...</span>
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-4 bg-white/70 rounded-xl border border-dashed border-slate-300 text-center">
          <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-600">No homework files submitted yet.</p>
          <p className="text-[11px] text-slate-400">Click "Upload Homework" above to submit your work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 shrink-0">
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
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenSignedUrl(item.file_path)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1E40AF] font-bold text-[11px] transition-colors flex items-center gap-1"
                  title="View / Download file"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFileToDelete(item)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
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
