"use client";
import Modal from "./Modal";

export default function ConfirmDialog({ open, title = "Konfirmasi", message, onCancel, onConfirm, confirmLabel = "Hapus", danger = true }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width="max-w-md"
      footer={
        <>
          <button className="btn-outline" onClick={onCancel}>Batal</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <p className="text-body-md text-on-surface">{message}</p>
    </Modal>
  );
}
