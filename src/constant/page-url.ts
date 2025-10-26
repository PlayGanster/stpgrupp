export const PAGES = {
    "HOME-PAGE": "/",
    "CATALOG-PAGE": "/catalog",
    "NEWS-PAGE": "/news",
    "CONTACTS-PAGE": "/contacts",
    "QUESTIONS-PAGE": "/questions",
    "JOB-PAGE": "/job",
    "DOCUMENT-PAGE": "/documents",
    "ABOUT-PAGE": "/about"
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
    },
    {
        name: "О компании",
        href: PAGES['ABOUT-PAGE']
    }
]

export const DocumentList: {name: string, href: string}[] = [
    {
        name: "Обработка персональных данных",
        href: `https://disk.yandex.by/i/tQUoXO0eksaKbg`
    },
    {
        name: "Согласие на обработку персональных данных",
        href: `https://disk.yandex.by/i/c0PgS0jfGWqbFQ`
    },
    {
        name: "Согласие на обработку персональных данных посредством сервисов веб-аналитики «Яндекс.Метрика» и ApMetrica",
        href: `https://disk.yandex.by/i/3fxZc47fFDNywg`
    },
    {
        name: "Согласие на информационную и рекламную рассылку",
        href: `https://disk.yandex.by/i/b60Rz_wcyK60lw`
    },
    {
        name: "Пользовательское соглашение",
        href: `https://disk.yandex.by/i/ZHPOe3zi9tglWg`
    }
]