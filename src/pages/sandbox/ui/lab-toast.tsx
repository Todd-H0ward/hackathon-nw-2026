type LabToastProps = {
  message: string;
};

export const LabToast = ({ message }: LabToastProps) => {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[1000] bg-[#243b32] border border-[#537c66] text-[#cae2d2] rounded-lg py-3.5 px-[22px] flex items-center gap-2.5 text-xs shadow-[0_8px_40px_#0008] max-w-[90vw]"
      role="status"
    >
      <span className="size-[5px] bg-[#8ed6b4] rounded-full inline-block shrink-0 shadow-[0_0_8px_#8ed6b433]" />
      {message}
    </div>
  );
};
