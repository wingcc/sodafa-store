// components/QuickAddDialog.tsx
"use client";

import { useUI } from "../contexts/UIContext";

export const QuickAddDialog = () => {
  const { isQuickAddOpen, closeQuickAdd } = useUI();

  return (
    <dialog
      open={isQuickAddOpen}
      onClose={closeQuickAdd}
      className="shadow-[0_5px_30px_0_rgba(0,0,0,0.15)] h-fit max-h-full max-w-full fixed w-screen border border-neutral-200 overflow-clip mt-auto mb-0 mx-0 p-0 rounded-none md:h-[616px] md:max-h-none md:max-w-none md:absolute md:w-[864px] md:overflow-hidden md:mb-auto md:mx-auto md:rounded-[14px]"
    >
      <button
        onClick={closeQuickAdd}
        aria-label="Close"
        className="content-center items-center appearance-none bg-transparent flex h-11 justify-center absolute text-center w-11 z-[2] p-0 rounded-[50%] right-[4.8px] top-[4.8px] hover:text-black/70"
      >
        <img src="https://c.animaapp.com/msjm1jgrK5NqH1/assets/icon-13.svg" alt="Close" className="h-[13.6px] w-[13.6px]" />
      </button>
      <div className="grid basis-[0%] grow grid-cols-[repeat(4,1fr)] grid-rows-[auto] max-h-[1000px] relative gap-y-4 overflow-auto p-5 md:gap-x-[normal] md:basis-auto md:grid-cols-[repeat(7,1fr)] md:grid-rows-[100%_1fr] md:gap-y-[normal] md:p-0">
        {/* Quick add content */}
        <p className="col-span-full text-center">Quick add product content goes here</p>
      </div>
    </dialog>
  );
};