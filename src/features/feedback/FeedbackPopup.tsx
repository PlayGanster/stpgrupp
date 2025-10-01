import Modal from "@/shared/ui/modal/Modal"
import FeedbackList from "./FeedbackList";
import { RxCross2 } from "react-icons/rx";
import { memo, useCallback } from "react";

interface FeedbackListType {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FeedbackPopup: React.FC<FeedbackListType> = memo(({
    setOpen
}) => {
    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const handleContentClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <Modal setOpen={setOpen}>
            <div className="w-full h-full flex justify-center items-center p-[6px] md:p-[12px]">
                {/* Обертка для скрытия выступающего скроллбара */}
                <div className="md:w-[700px] w-[500px] max-[550px]:w-dvw max-[550px]:h-[calc(100dvh-0px)] rounded-0 min-[550px]:rounded-[20px] md:rounded-[40px] overflow-hidden">
                    <div 
                        className="p-[20px] h-full max-h-[80vh] max-[550px]:max-h-[calc(100dvh-0px)] relative md:p-[40px] bg-[#F2F1EF] scrollbar-custom" 
                        onClick={handleContentClick}
                    >
                        <div className="w-full flex items-center justify-between mb-3">
                            <h2 className="font-black text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)]">Отзывы клиентов</h2>
                            <RxCross2 
                                onClick={handleClose} 
                                size={22} 
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="h-full w-full overflow-y-auto pb-[100px]">
                            <FeedbackList view="all" name={false} />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
});

FeedbackPopup.displayName = "FeedbackPopup";

export default FeedbackPopup;