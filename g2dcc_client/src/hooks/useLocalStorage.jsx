import { useEffect, useState } from "react"

export const useLocalStorage = (key,initalValue) =>{
    const [value,setValue] = useState(()=>{
        const storedValue = localStorage.getItem(key)
        return storedValue ? JSON.parse(storedValue) : initalValue
    })

    useEffect(()=>{
        localStorage.setItem(key,JSON.stringify(value))
    },[key,value])

    return {value,setValue}
}