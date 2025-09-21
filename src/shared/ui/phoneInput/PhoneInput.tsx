"use client"

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface PhoneInputType {
    phone: string;
    setPhone: React.Dispatch<React.SetStateAction<string>>;
}

const PhoneInput: React.FC<PhoneInputType> = ({
    phone, setPhone
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const lastKey = useRef<string | null>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    lastKey.current = e.key
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const prevPhone = phone
    
    // Удаление всех нецифр
    let digits = input.replace(/\D/g, '')
    
    // Обработка Backspace/Delete
    if (lastKey.current === 'Backspace' || lastKey.current === 'Delete') {
      if (digits.length < 2) {
        setPhone('+7 (')
        return
      }
      
      digits = digits.substring(0, digits.length - 1)
    } else {
      // Ограничение длины
      if (digits.length > 11) {
        digits = digits.substring(0, 11)
      }
    }

    // Форматирование
    let formatted = '+7 ('
    if (digits.length > 1) {
      formatted += digits.substring(1, 4)
      
      if (digits.length > 4) {
        formatted += ') ' + digits.substring(4, 7)
        
        if (digits.length > 7) {
          formatted += '-' + digits.substring(7, 9)
          
          if (digits.length > 9) {
            formatted += '-' + digits.substring(9, 11)
          }
        }
      }
    }

    // Сохраняем позицию курсора
    const cursorPos = e.target.selectionStart || 0
    const diff = formatted.length - prevPhone.length
    
    setPhone(formatted)
    
    // Корректируем позицию курсора после рендера
    setTimeout(() => {
      if (inputRef.current) {
        let newPos = cursorPos
        
        if (lastKey.current === 'Backspace') {
          // При удалении учитываем удаляемые символы
          const deletedChars = prevPhone.length - input.length
          newPos = Math.max(4, cursorPos - deletedChars)
        } else if (diff > 0) {
          // При добавлении учитываем добавленные символы
          newPos = cursorPos + diff
        }
        
        // Пропускаем позиции с разделителями
        const nextChar = formatted[newPos]
        if (nextChar === ')' || nextChar === ' ' || nextChar === '-') {
          newPos += 1
        }
        
        inputRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  return (
    <input
      ref={inputRef}
      type="tel"
      value={phone}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="+7 (___) ___-__-__"
      className="w-full h-[45px] mt-[12px] md:text-[16px] text-[14px] rounded-[12px] outline-none bg-[white] px-[15px] py-[8px]"
    />
  )
}

export default PhoneInput