import { useEffect, useRef } from "react";

interface ModalType {
    children: React.ReactNode;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    ariaLabel?: string; // для aria-label или aria-labelledby
}

const Modal: React.FC<ModalType> = ({
    children,
    setOpen,
    ariaLabel = "Модальное окно"
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Закрытие по Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        // Сохраняем первоначальные стили
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        
        // Отключаем скролл у body с !important
        document.body.setAttribute('style', 'overflow: hidden !important; position: fixed !important; width: 100% !important;');
        
        // Добавляем обработчик клавиш
        document.addEventListener("keydown", onKeyDown);

        return () => {
            // Восстанавливаем стили
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.width = '';
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [setOpen]);

    // Остановка распространения клика внутри модалки
    const onContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            onClick={() => setOpen(false)}
            className="fixed flex justify-center items-center z-100 top-0 left-0 w-dvw h-dvh bg-[rgba(0,0,0,0.5)]"
            ref={modalRef}
        >
            <div onClick={onContentClick} tabIndex={-1}>
                {children}
            </div>
        </div>
    );
};

export default Modal;
