"use client"

import Button from "@/shared/ui/button/Button"
import Checkbox from "@/shared/ui/checkbox/Checkbox"
import PhoneInput from "@/shared/ui/phoneInput/PhoneInput"
import { useRef, useState, useCallback, memo } from "react"

// Мемоизированные статичные компоненты с семантикой
const Heading = memo(() => (
  <h2 className="lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)] font-black leading-[1.2]">
    Оставьте заявку<br/>
    на бесплатную консультацию
  </h2>
))
Heading.displayName = "Heading"

const Subheading = memo(() => (
  <p className="mt-[12px] lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]" id="contact-form-subheading">
    *Мы перезвоним Вам в течение 2 минут
  </p>
))
Subheading.displayName = "Subheading"

const PlaceholderText = memo(() => (
  <div className="absolute top-[8px] z-3 left-[15px] pr-[15px] md:text-[16px] text-[14px] text-[#8F8F8F] pointer-events-none select-none" aria-hidden="true">
    <p>Ваш комментарий облегчит обработку заявки</p>
    <p>Не обязателен к заполнению</p>
    <p className="font-semibold">Вид техники / Задача / Локация / Время / Форма оплаты</p>
  </div>
))
PlaceholderText.displayName = "PlaceholderText"

const SubmitButtons = memo(() => (
  <div className="w-full flex justify-end">
    <div className="md:flex hidden">
      <Button name="Отправить заявку" weight="bold" size="large" height={45} color="red" />
    </div>
    <div className="md:hidden flex">
      <Button name="Отправить заявку" weight="bold" size="small" height={35} color="red" />
    </div>
  </div>
))
SubmitButtons.displayName = "SubmitButtons"

const ContactForm = () => {
  const [phone, setPhone] = useState('+7 (')
  const [pin, setPin] = useState("")
  const [check, setCheck] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePinChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPin(e.target.value)
  }, [])

  // Можно добавить валидацию и обработчик submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!check) {
      alert("Пожалуйста, дайте согласие на обработку персональных данных")
      return
    }
    // Логика отправки формы
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="contact-form-heading" aria-describedby="contact-form-subheading" noValidate>
      <Heading />
      <Subheading />

      <label htmlFor="phone-input" className="sr-only">Телефон</label>
      <PhoneInput 
        phone={phone} 
        setPhone={setPhone} 
        aria-required="true"
        aria-describedby="phone-help"
      />
      <div id="phone-help" className="sr-only">Введите номер телефона в формате +7 (XXX) XXX-XX-XX</div>

      <div className="relative w-full mt-[12px]">
        <label htmlFor="comment-textarea" className="sr-only">Комментарий</label>
        <textarea
          id="comment-textarea"
          ref={textareaRef}
          value={pin}
          onChange={handlePinChange}
          className="px-[15px] placeholder:text-white py-[8px] md:text-[16px] text-[14px] rounded-[12px] bg-white w-full min-h-[150px] text-black outline-none relative z-2 max-h-[200px]"
          placeholder="Ваш комментарий облегчит обработку заявки. Не обязателен к заполнению."
          aria-describedby="comment-placeholder"
        />
        {!pin && <PlaceholderText />}
      </div>

      <Checkbox 
        value={check} 
        setValue={setCheck} 
        name="Даю согласие на обработку персональных данных" 
        aria-required="true"
      />
      <div className="h-[12px]" />

      <SubmitButtons />
    </form>
  )
}

export default ContactForm
