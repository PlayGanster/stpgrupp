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
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        // Отключаем скролл у body
        document.body.style.overflow = 'hidden';
        
        // Добавляем обработчик клавиш
        document.addEventListener("keydown", onKeyDown);

        return () => {
            // Восстанавливаем скролл при размонтировании
            document.body.style.overflow = originalStyle;
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
