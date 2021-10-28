import { useCallback, useState } from 'react'
import { AppState } from 'react-native'

const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState)

  const isValidFunction = useCallback(func => {
    return func && typeof func === 'function'
  })

  const onAppStateChange = useCallback(
    ({ onChange, onForeground, onBackground }) => {
      function handleAppStateChange(nextAppState) {
        if (nextAppState === 'active') {
          isValidFunction(onForeground) && onForeground()
        } else if (
          appState === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          isValidFunction(onBackground) && onBackground()
        }
        setAppState(nextAppState)
        isValidFunction(onChange) && onChange(nextAppState)
      }

      AppState.addEventListener('change', handleAppStateChange)

      return () => AppState.removeEventListener('change', handleAppStateChange)
    }
  )

  return [onAppStateChange]
}

export default useAppState
