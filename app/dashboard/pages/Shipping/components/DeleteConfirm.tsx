// Delete confirmation dialog shared by destructive actions.

interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  subject: string;
  isDeleting: boolean;
}
const DeleteConfirm = ({ open, onClose, onConfirm, title, subject, isDeleting }: DeleteConfirmProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">
          Are you sure you want to delete <span className="font-semibold">&ldquo;{subject}&rdquo;</span>? This action
          cannot be undone.
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
