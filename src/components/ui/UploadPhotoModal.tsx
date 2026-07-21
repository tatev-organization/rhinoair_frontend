import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Icons } from "@/components/ui/Icons";

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialFile: File | null;
  uploadFn: (formData: FormData) => Promise<any>;
}

export function UploadPhotoModal({
  isOpen,
  onClose,
  projectId,
  initialFile,
  uploadFn,
}: UploadPhotoModalProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [phase, setPhase] = useState("Rough-in · Pre-cover Proof");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("phase", phase);
    formData.append("file", file);

    try {
      await uploadFn(formData);
      onClose();
      setFile(null);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Photo">
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
            Selected Image
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              style={{ width: 20, height: 20, opacity: 0.7 }}
            >
              <path
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
              {file ? file.name : "Click to browse or drag image here"}
            </span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {/* Phase Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: "var(--tx-sub)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Project Phase
          </span>
          <select
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--tx-main)",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
            }}
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
          >
            <option value="Rough-in · Pre-cover Proof">
              Rough-in · Pre-cover Proof
            </option>
            <option value="Finish & Completion">Finish & Completion</option>
            <option value="Other">Other</option>
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
