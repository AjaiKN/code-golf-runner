import { Ref, ref, watchEffect } from 'vue'
import destr from 'destr'

/** Returns a ref that automatically gets stored in localStorage whenever it changes */
export function useLocalStorageRef<T>(key: string, initialState: T): Ref<T> {
  const storedStr = localStorage.getItem(key)
  const ret: Ref<T> = ref(storedStr == null ? initialState : destr(storedStr))
  watchEffect(() => localStorage.setItem(key, JSON.stringify(ret.value)))
  return ret
}
