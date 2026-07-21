import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Icons } from "@/components/ui/Icons";
import { useUploadDocumentMutation } from "@/redux/features/projects/projectsApi";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialFile: File | null;
  uploadFn?: (formData: FormData) => Promise<any>;
}

const CATEGORIES = [
  "Plans & Blueprints",
  "Estimate",
  "Agreements",
  "Change Orders",
  "Submittals & Spec Sheets",
  "Permits",
  "Certificates",
  "Shared Files",
];

export function UploadDocumentModal({
  isOpen,
  onClose,
  projectId,
  initialFile,
  uploadFn,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [category, setCategory] = useState(CATEGORIES[7]); // Default to Shared Files

  // Default to partner portal mutation if uploadFn is not provided
  const [defaultUploadDocument, { isLoading: isDefaultLoading }] =
    useUploadDocumentMutation();
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const isLoading = uploadFn ? isCustomLoading : isDefaultLoading;

  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    if (uploadFn) setIsCustomLoading(true);

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("category", category);
    formData.append("file", file);

    try {
      if (uploadFn) {
        await uploadFn(formData);
      } else {
        await defaultUploadDocument(formData).unwrap();
      }
      onClose();
      setFile(null);
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to upload document",
      );
    } finally {
      if (uploadFn) setIsCustomLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Selected File */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: "var(--tx-sub)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Selected File
          </span>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              cursor: "pointer",
              background: "transparent",
              color: "var(--tx-main)",
            }}
          >
            <Icons.doc style={{ width: 20, height: 20, opacity: 0.7 }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {file ? file.name : "Click to browse or drag file here"}
            </span>
            <input
              type="file"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {/* Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: "var(--tx-sub)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Category
          </span>
          <select
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg-main)",
              color: "var(--tx-main)",
              fontSize: 14,
              fontWeight: 500,
              outline: "none",
              appearance: "none",
              cursor: "pointer",
            }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, marginTop: 4 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            className="btn-ghost"
            style={{ flex: 1, border: "1px solid var(--border)" }}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{
              flex: 1,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handleUpload}
            disabled={isLoading || !file}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
