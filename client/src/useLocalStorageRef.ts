import { Ref, ref, watchEffect } from 'vue'

export function useLocalStorageRef<T>(key: string, initialState: T): Ref<T> {
  const storedStr = localStorage.getItem(key)
  const ret: Ref<T> = ref(
    storedStr == null ? initialState : JSON.parse(storedStr),
  )
  watchEffect(() => localStorage.setItem(key, JSON.stringify(ret.value)))
  return ret
}
