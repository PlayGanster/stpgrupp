import { API_BASE_URL } from '@/constant/api-url';

export interface Question {
    id: number;
    question: string;
    answer: string | null;
    created_at: string;
}

export interface QuestionCreateData {
    question: string;
    answer?: string;
}

// Функция для получения всех вопросов
export async function getQuestionsList(): Promise<Question[]> {
    const fallbackQuestions: Question[] = [
        {
            id: 1,
            question: "Это дефолтный вопрос?",
            answer: "Да, это дефолтный вопрос для тестирования",
            created_at: "2024-01-01T00:00:00Z"
        },
        {
            id: 2,
            question: "Как работает этот сервис?",
            answer: null,
            created_at: "2024-01-02T00:00:00Z"
        }
    ];

    return fetchWithCache<Question[]>(`${API_BASE_URL}/questions/`, fallbackQuestions);
}

// Функция для получения вопроса по ID
export async function getQuestion(id: number): Promise<Question | null> {
    const fallbackQuestion: Question = {
        id: id,
        question: "Дефолтный вопрос",
        answer: "Дефолтный ответ",
        created_at: "2024-01-01T00:00:00Z"
    };

    const data = await fetchWithCache<Question | Question[]>(
        `${API_BASE_URL}/questions/${id}`,
        fallbackQuestion
    );
    
    return Array.isArray(data) ? data[0] || null : data;
}

// Функция для создания нового вопроса
export async function createQuestion(questionData: QuestionCreateData): Promise<Question | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating question:', error);
        return null;
    }
}

// Функция для обновления вопроса
export async function updateQuestion(id: number, questionData: Partial<QuestionCreateData>): Promise<Question | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating question:', error);
        return null;
    }
}

// Функция для удаления вопроса
export async function deleteQuestion(id: number): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting question:', error);
        return false;
    }
}

// Функция для поиска вопросов по ключевому слову
export async function searchQuestions(keyword: string): Promise<Question[]> {
    const fallbackQuestions: Question[] = [
        {
            id: 1,
            question: `Результат поиска по: ${keyword}`,
            answer: "Ответ на найденный вопрос",
            created_at: "2024-01-01T00:00:00Z"
        }
    ];

    return fetchWithCache<Question[]>(
        `${API_BASE_URL}/questions/search?keyword=${encodeURIComponent(keyword)}`,
        fallbackQuestions
    );
}

// Функция для получения неотвеченных вопросов
export async function getUnansweredQuestions(): Promise<Question[]> {
    const fallbackQuestions: Question[] = [
        {
            id: 2,
            question: "Неотвеченный вопрос",
            answer: null,
            created_at: "2024-01-02T00:00:00Z"
        }
    ];

    return fetchWithCache<Question[]>(
        `${API_BASE_URL}/questions/unanswered`,
        fallbackQuestions
    );
}

// Дополнительные полезные функции для работы с вопросами
export function filterAnsweredQuestions(questions: Question[]): Question[] {
    return questions.filter(question => question.answer !== null && question.answer !== '');
}

export function filterUnansweredQuestions(questions: Question[]): Question[] {
    return questions.filter(question => question.answer === null || question.answer === '');
}

export function sortQuestionsByDate(questions: Question[], ascending: boolean = false): Question[] {
    return [...questions].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

export function formatQuestionDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function truncateQuestionText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Общая функция для выполнения запросов с кешированием
export async function fetchWithCache<T>(url: string, fallback: T): Promise<T> {
    try {
        const response = await fetch(url, {
            next: {
                revalidate: 900 // 15 минут кеширования
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return fallback;
    }
}