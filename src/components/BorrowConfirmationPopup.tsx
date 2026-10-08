import { useEffect } from "react"

type Props = {
  toyName: string
  onClose: () => void
}

export function BorrowConfirmationPopup({ toyName, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className="min-h-60 md:min-h-80 2xl:min-h-110 w-80 md:w-150 backdrop-blur-[2px] bg-theme-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.08)]
    flex flex-col items-center px-5 sm:px-10 rounded-[20px] justify-between">
        <div className="flex flex-col">
          <h1 className="heading mt-5 text-center">You're all set!</h1>
          <p className="subtext text-center mt-5">
            Your request for <strong>{toyName}</strong> has been received. A team member will reach out shortly
            with next steps. There's nothing else you need to do for now.
          </p>
        </div>
        <button className="bg-theme-red hover:bg-theme-dk-red cursor-pointer transition-colors duration-200 text-theme-white rounded-full lgbutton mb-5 sm:mb-10"
          onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
