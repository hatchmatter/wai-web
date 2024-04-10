import { forwardRef } from "react";

type DialogProps = {
  children: React.ReactNode;
};

/**
 * Usage: assign to the component ref
 * ref.current.showModal() to show the dialog
 * ref.current.close() to close the dialog
 * 
 * example children:
 * <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click the button below to close</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">Close</button>
      </form>
    </div>
 */

export const Dialog = forwardRef(function Dialog(
  { children }: DialogProps,
  ref: React.Ref<HTMLDialogElement>
) {
  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">{children}</div>
    </dialog>
  );
});
