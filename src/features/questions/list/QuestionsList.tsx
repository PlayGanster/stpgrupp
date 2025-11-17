"use client"

import { useEffect, useState } from "react"
import QuestionItem from "../../../shared/components/questions/QuestionItem"
import { getQuestionsList, Question } from "@/actions/questions"
import { CITY_CASES, CitySlug, DEFAULT_CITY } from '@/config/cities';
import Button from "@/shared/ui/button/Button";
import Modal from "@/shared/ui/modal/Modal";
import { RxCross2 } from "react-icons/rx";
import ContactForm from "@/features/form/ContactForm";

interface QuestionsListProps {
    citySlug: CitySlug;
    preprocessedBaseQuestions: Question[];
}

const QuestionsList = ({ citySlug, preprocessedBaseQuestions }: QuestionsListProps) => {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [openModal, setOpenModal] = useState(false);

    // Функция для замены плейсхолдеров на клиенте
    const processQuestionText = (text: string) => {
        const city = CITY_CASES[citySlug] || CITY_CASES[DEFAULT_CITY];
        return text.replace(/\[city\]/g, city.genitive)
                  .replace(/\[city-dative\]/g, city.dative)
                  .replace(/\[city-prepositional\]/g, city.prepositional);
    }

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true)
                const questionsData = await getQuestionsList()
                
                // Обрабатываем вопросы с заменой города
                const processedQuestions = questionsData.map(question => ({
                    ...question,
                    question: processQuestionText(question.question),
                    answer: question.answer ? processQuestionText(question.answer) : "Ответ на данный вопрос пока не предоставлен"
                }))
                
                setQuestions(processedQuestions)
            } catch (err) {
                setError("Не удалось загрузить вопросы")
                console.error("Error fetching questions:", err)
                // Используем предобработанные базовые вопросы
                setQuestions(preprocessedBaseQuestions)
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()
    }, [citySlug, preprocessedBaseQuestions])

    if (loading) {
        return (
            <div className="w-full flex flex-col gap-[36px] mt-[20px]" aria-label="Загрузка вопросов">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="animate-pulse rounded-lg">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error && questions.length === 0) {
        return (
            <div className="w-full text-center py-8 text-red-600" role="alert" aria-live="polite">
                {error}
                <p className="text-sm text-gray-600 mt-2">Показаны основные часто задаваемые вопросы</p>
            </div>
        )
    }

    return (
        <>
            {openModal && (
                <Modal setOpen={setOpenModal}>
                    <div className="w-full h-full flex justify-center items-center p-[12px]">
                        <div className="relative max-w-[700px] w-full p-[20px] md:p-[40px] bg-[#F2F1EF] rounded-[20px] md:rounded-[40px]" onClick={(e) => e.stopPropagation()}>
                            <RxCross2 onClick={() => setOpenModal(false)} size={22} className="absolute top-[15px] right-[15px] z-22 cursor-pointer" />
                            <ContactForm page="Вопросы" />
                        </div>
                    </div>
                </Modal>
            )}
            
            <div 
                className="w-full flex flex-col gap-[20px] mt-[20px]" 
                itemScope 
                itemType="https://schema.org/FAQPage"
                aria-label="Часто задаваемые вопросы"
            >
                <meta itemProp="name" content="Часто задаваемые вопросы об аренде спецтехники" />
                
                {/* Добавляем структурированные данные для всех вопросов сразу */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": questions.map((question, index) => ({
                                "@type": "Question",
                                "name": question.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": question.answer
                                },
                                "position": index + 1
                            }))
                        })
                    }}
                />
                
                {questions.map((question) => (
                    <QuestionItem 
                        key={question.id}
                        name={question.question}
                        description={String(question.answer)}
                        itemProp="mainEntity"
                        itemType="https://schema.org/Question"
                    />
                ))}

                {/* Дополнительная SEO информация */}
                <div className="mt-4 p-3 md:p-6 bg-gray-50 rounded-lg shadow-xl" itemScope itemType="https://schema.org/WebPageElement">
                    <h2 className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-semibold mb-4" itemProp="name">Не нашли ответ на свой вопрос?</h2>
                    <p className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] text-gray-700 mb-4" itemProp="description">
                        Свяжитесь с нашими специалистами, и мы с радостью ответим на все ваши вопросы 
                        об аренде спецтехники, условиях сотрудничества и доставке.
                    </p>
                    <div className="flex min-[500px]:flex-row flex-col gap-3">
                        <Button 
                            width="full"
                            name="Позвонить по телефону"
                            onClick={() => setOpenModal(true)}
                        />
                        <Button 
                            width="full"
                            name="Написать в WhatsApp"
                            color="green"
                            onClick={() => window.open("https://wa.me/89630081446", "_blank")}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default QuestionsList