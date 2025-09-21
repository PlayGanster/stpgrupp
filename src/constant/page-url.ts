export const PAGES = {
    "HOME-PAGE": "/",
    "CATALOG-PAGE": "/catalog",
    "NEWS-PAGE": "/news",
    "CONTACTS-PAGE": "/contacts",
    "QUESTIONS-PAGE": "/questions",
    "JOB-PAGE": "/job",
    "DOCUMENT-PAGE": "/documents",
}

export const menuHeader: {name: string, href: string}[] = [
    {
        name: "Главная",
        href: PAGES["HOME-PAGE"]
    },
    {
        name: "Каталог",
        href: PAGES['CATALOG-PAGE']
    },
    {
        name: "Новости",
        href: PAGES['NEWS-PAGE']
    },
    {
        name: "Контакты",
        href: PAGES['CONTACTS-PAGE']
    },
    {
        name: "Вопросы",
        href: PAGES['QUESTIONS-PAGE']
    },
    {
        name: "Вакансии",
        href: PAGES['JOB-PAGE']
    }
]

export const DocumentList: {name: string, href: string}[] = [
    {
        name: "Обработка персональных данных",
        href: `${PAGES['DOCUMENT-PAGE']}/processing-of-personal-data`
    },
    {
        name: "Согласие на обработку персональных данных",
        href: `${PAGES['DOCUMENT-PAGE']}/сonsent-to-the-processing-of-personal-data`
    },
    {
        name: "Согласие на обработку персональных данных посредством сервисов веб-аналитики «Яндекс.Метрика» и ApMetrica",
        href: `${PAGES['DOCUMENT-PAGE']}/сonsent-to-the-processing-of-personal-data-yandex-apmetrica`
    },
    {
        name: "Согласие на информационную и рекламную рассылку",
        href: `${PAGES['DOCUMENT-PAGE']}/consent-to-information-and-advertising-newsletters`
    },
    {
        name: "Пользовательское соглашение",
        href: `${PAGES['DOCUMENT-PAGE']}/user-agreement`
    }
]