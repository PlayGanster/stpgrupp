"use client"

import Modal from "@/shared/ui/modal/Modal"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import ReelsImage from "@/assets/reels/reels.jpg"
import Button from "@/shared/ui/button/Button"
import { API_BASE_URL } from '@/constant/api-url';
import { useParams } from "next/navigation"

interface Reel {
  id: number;
  image: string;
  description: string;
  date: string;
  product_id: number;
  created_at: string;
  name: string;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

const ReelsList = () => {
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [selectReels, setSelectReels] = useState<number | null>(null);
    const [openReels, setOpenReels] = useState(false);
    const [reelsList, setReelsList] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const params = useParams();
    const product_id = params.id as string;

    // Функция для отключения скролла
    const disableScroll = useCallback(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }, []);

    // Функция для включения скролла
    const enableScroll = useCallback(() => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }, []);

    useEffect(() => {
        if (openReels) {
            disableScroll();
        } else {
            enableScroll();
        }

        // Восстановить скролл при размонтировании компонента
        return () => {
            enableScroll();
        };
    }, [openReels, disableScroll, enableScroll]);

    const fetchReels = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const cachedData = localStorage.getItem('cachedReels');
            const cacheTimestamp = localStorage.getItem('reelsCacheTimestamp');
            
            const now = Date.now();
            
            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
                const parsedData: Reel[] = JSON.parse(cachedData);
                const filteredData = product_id 
                    ? parsedData.filter(el => el.product_id === Number(product_id))
                    : parsedData;
                setReelsList(filteredData);
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/reels`, {
                next: { revalidate: 600 }
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при загрузке рилсов');
            }
            const data: Reel[] = await response.json();
            
            localStorage.setItem('cachedReels', JSON.stringify(data));
            localStorage.setItem('reelsCacheTimestamp', now.toString());
            
            const filteredData = product_id 
                ? data.filter(el => el.product_id === Number(product_id))
                : data;
            setReelsList(filteredData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки рилсов:', err);
        } finally {
            setLoading(false);
        }
    }, [product_id]);

    useEffect(() => {
        fetchReels();
    }, [fetchReels]);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            handleScroll();
            return () => {
                scrollContainer.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll, reelsList.length]);

    const scrollLeft = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    }, []);

    const startProgressTimer = useCallback(() => {
        stopProgressTimer();
        
        const startTime = Date.now();
        const duration = 15000;
        
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = Math.min((elapsedTime / duration) * 100, 100);
            setProgress(newProgress);
            
            if (newProgress >= 100) {
                stopProgressTimer();
                goToNextReel();
            }
        }, 16);
    }, []);

    const stopProgressTimer = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const goToNextReel = useCallback(() => {
        if (reelsList.length === 0) return;
        
        const nextIndex = (currentReelIndex + 1) % reelsList.length;
        
        if (nextIndex === 0) {
            setOpenReels(false);
            setSelectReels(null);
        } else {
            setSelectReels(reelsList[nextIndex].id);
            setCurrentReelIndex(nextIndex);
        }
    }, [reelsList, currentReelIndex]);

    const goToPreviousReel = useCallback(() => {
        if (reelsList.length === 0) return;
        
        const prevIndex = (currentReelIndex - 1 + reelsList.length) % reelsList.length;
        setSelectReels(reelsList[prevIndex].id);
        setCurrentReelIndex(prevIndex);
    }, [reelsList, currentReelIndex]);

    useEffect(() => {
        if (openReels && selectReels !== null) {
            startProgressTimer();
        } else {
            stopProgressTimer();
            setProgress(0);
        }

        return () => {
            stopProgressTimer();
        };
    }, [openReels, selectReels, currentReelIndex, startProgressTimer, stopProgressTimer]);

    const handleReelClick = useCallback((reelId: number) => {
        const index = reelsList.findIndex(reel => reel.id === reelId);
        setSelectReels(reelId);
        setCurrentReelIndex(index);
        setOpenReels(true);
    }, [reelsList]);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, []);

    const SelectedReelModal = useMemo(() => {
        if (!openReels || selectReels === null) return null;
        
        const selectedReel = reelsList.find(reel => reel.id === selectReels);
        if (!selectedReel) return null;

        return (
            <Modal setOpen={setOpenReels} ariaLabel="Модальное окно с рилсом">
                <div className="w-[100dvw] h-full flex justify-center items-center bg-black md:p-[12px]">
                    <div className="md:max-w-[500px] w-[100dvw] md:w-full h-[100dvh] justify-between p-[12px] flex flex-col md:p-[12px] bg-[#F2F1EF] md:rounded-[20px] relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full z-12 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-full z-12 h-100 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                        
                        <button 
                            aria-label="Предыдущий рилс"
                            className="absolute w-1/2 h-full left-0 z-10 top-0 cursor-pointer bg-transparent border-none"
                            onClick={goToPreviousReel}
                            type="button"
                        />
                        <button 
                            aria-label="Следующий рилс"
                            className="absolute w-1/2 h-full right-0 z-10 top-0 cursor-pointer bg-transparent border-none"
                            onClick={goToNextReel}
                            type="button"
                        />

                        <Image
                            src={`${API_BASE_URL}/uploads/reels/${selectedReel.image}`}  
                            fill 
                            className="object-cover object-center z-1" 
                            sizes="(max-width: 610px) 100vw, 50vw" 
                            alt={selectedReel.description || 'Reels'}
                            priority
                        />
                        <div className="flex justify-between items-center relative z-12">
                            <button 
                              onClick={() => setOpenReels(false)} 
                              className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-white cursor-pointer bg-transparent border-none p-0"
                              aria-label="Закрыть модальное окно"
                              type="button"
                            >
                              &lt; Назад
                            </button>
                            <Button name="Заказать" size="small" height={35} padding="normal" color="red" />
                        </div>
                        <div className="flex flex-col gap-[6px] relative z-12">
                            <p className="text-[length:var(--size-mobile-small-text)] md:text-[length:var(--size-md-small-text)] lg:text-[length:var(--size-lg-small-text)] text-[white] font-black">
                                {selectedReel.description}
                            </p>
                            <p className="text-[length:var(--size-mobile-small-text)] md:text-[length:var(--size-md-small-text)] lg:text-[length:var(--size-lg-small-text)] text-[white] font-semibold">
                                {formatDate(selectedReel.date)}
                            </p>
                            <div 
                              className="w-full h-[10px] rounded-[20px] bg-white/50 overflow-hidden"
                              role="progressbar"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={Math.round(progress)}
                              aria-label="Прогресс просмотра рилса"
                            >
                                <div 
                                    className="h-full bg-[#FF4052] transition-all duration-100 ease-linear"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }, [openReels, selectReels, reelsList, progress, goToPreviousReel, goToNextReel, formatDate]);

    const LoadingSkeleton = useMemo(() => (
        <section aria-busy="true" aria-live="polite" aria-label="Загрузка рилсов" className="relative mt-[12px]">
            <div className="flex gap-[12px] p-[4px] items-center overflow-x-hidden">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="flex flex-col gap-[6px] items-center flex-shrink-0">
                        <div className="w-[100px] h-[100px] rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </section>
    ), []);

    const ErrorState = useMemo(() => (
        <section role="alert" aria-live="assertive" className="relative mt-[12px] p-4 text-center text-red-500">
            <p>Ошибка загрузки рилсов: {error}</p>
            <button 
                onClick={fetchReels}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
                aria-label="Попробовать загрузить рилсы снова"
            >
                Попробовать снова
            </button>
        </section>
    ), [error, fetchReels]);

    const EmptyState = useMemo(() => (
        <section aria-live="polite" className="relative mt-[12px] p-4 text-center text-gray-500">
            <p>Рилсы не найдены</p>
        </section>
    ), []);

    if (loading) return LoadingSkeleton;
    if (error) return ErrorState;
    if (reelsList.length === 0) return EmptyState;

    return (
        <section aria-label="Список рилсов" className="relative mt-[12px]">
            {SelectedReelModal}
            {showLeftArrow && (
                <button 
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Прокрутить рилсы влево"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            
            <div 
                ref={scrollContainerRef}
                className="flex gap-[12px] p-[4px] items-center overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                role="list"
                tabIndex={0}
            >
                {reelsList.map((reel) => (
                    <div 
                        key={reel.id} 
                        onClick={() => handleReelClick(reel.id)} 
                        className="flex flex-col gap-[6px] items-center cursor-pointer flex-shrink-0"
                        role="listitem"
                        tabIndex={-1}
                        aria-label={`Открыть рилс: ${reel.name}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleReelClick(reel.id);
                            }
                        }}
                    >
                        <div className="w-[100px] h-[100px] rounded-full bg-black relative overflow-hidden outline-2 border-2 border-white outline-[var(--href-hover-color)]">
                            <Image 
                                src={`${API_BASE_URL}/uploads/reels/${reel.image}`} 
                                fill 
                                className="object-cover" 
                                sizes="(max-width: 610px) 100vw, 50vw" 
                                alt={reel.description || reel.name}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = ReelsImage.src;
                                }}
                            />
                        </div>
                        <p className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)] font-semibold truncate max-w-[100px] text-center">
                            {reel.name}
                        </p>
                    </div>
                ))}
            </div>
            
            {showRightArrow && (
                <button 
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Прокрутить рилсы вправо"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default ReelsList;