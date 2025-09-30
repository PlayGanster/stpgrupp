"use client"

import Button from "@/shared/ui/button/Button"
import Checkbox from "@/shared/ui/checkbox/Checkbox"
import PhoneInput from "@/shared/ui/phoneInput/PhoneInput"
import { useRef, useState, useCallback, memo } from "react"
import { useCity } from '@/hooks/useCity'
import { CITY_CASES } from '@/config/cities'

// Мемоизированные статичные компоненты с семантикой
const Heading = memo(({ cityPrepositional }: { cityPrepositional: string }) => (
  <h1 className="text-center lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)] font-black leading-[1.2] md:mb-6 mb-3 md:mt-0 mt-3">
    Заказать аренду спецтехники<br/> {cityPrepositional}
  </h1>
))
Heading.displayName = "Heading"

const PhoneNumber = memo(() => (
  <div className="lg:text-5xl md:text-4xl text-2xl text-center font-black md:mb-6 mb-3">
    +7 930 333 4046
  </div>
))
PhoneNumber.displayName = "PhoneNumber"

const CallToAction = memo(() => (
  <p className="text-center md:mb-6 mb-3 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
    Или закажите звонок указав свой номер ниже
  </p>
))
CallToAction.displayName = "CallToAction"

const SubmitButtons = memo(() => (
  <div className="w-full flex justify-center">
    <div className="md:flex hidden">
      <Button name="Заказать обратный звонок" weight="bold" size="large" height={45} color="red" />
    </div>
    <div className="md:hidden flex">
      <Button name="Заказать обратный звонок" weight="bold" size="small" height={35} color="red" />
    </div>
  </div>
))
SubmitButtons.displayName = "SubmitButtons"

const CallForm = () => {
  const [phone, setPhone] = useState('+7 (')
  const [check, setCheck] = useState(false)
  
  // Получаем информацию о городе
  const { slug, isCityVersion } = useCity()
  
  // Определяем город в предложном падеже
  const getCityInPrepositionalCase = () => {
    if (!isCityVersion || !slug) {
      return "Москве" // значение по умолчанию
    }
    
    const cityData = CITY_CASES[slug as keyof typeof CITY_CASES]
    return cityData ? `в ${cityData.dative}` : "Москве"
  }
  
  const cityPrepositional = getCityInPrepositionalCase()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!check) {
      alert("Пожалуйста, дайте согласие на обработку персональных данных")
      return
    }
    // Логика отправки формы
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="contact-form-heading" noValidate>
      <Heading cityPrepositional={cityPrepositional} />
      <PhoneNumber />
      <CallToAction />

      <div className="space-y-4">
        <PhoneInput 
          phone={phone} 
          setPhone={setPhone} 
          aria-required="true"
          aria-describedby="phone-help"
        />
        <div id="phone-help" className="sr-only">Введите номер телефона в формате +7 (XXX) XXX-XX-XX</div>
      </div>

        <div className="w-full flex justify-center">
        <Checkbox 
            value={check} 
            setValue={setCheck} 
            name="Даю согласие на обработку персональных данных" 
            aria-required="true"
        />
        </div>
      
      <div className="mt-6 flex justify-center w-full">
        <SubmitButtons />
      </div>
    </form>
  )
}

export default CallForm