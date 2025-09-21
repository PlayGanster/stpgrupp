"use client"

interface HeaderAdminType {
    name: string
}

const HeaderAdmin: React.FC<HeaderAdminType> = ({
    name
}) => {
    return (
        <div className="h-[60px] w-full flex items-center text-[24px] font-black">
            АДМИН-ПАНЕЛЬ / {name.toUpperCase()}
        </div>
    )
}

export default HeaderAdmin