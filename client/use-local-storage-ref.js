import {
  ref,
  watchEffect,
} from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.js'

export function useLocalStorageRef(key, initialState) {
  const storedStr = localStorage.getItem(key)
  const ret = ref(storedStr == null ? initialState : JSON.parse(storedStr))
  watchEffect(() => localStorage.setItem(key, JSON.stringify(ret.value)))
  return ret
}
