import React from 'react'
import Shortcut from 'react-native-shortcut-badge'
import { Platform } from 'react-native'
import PushNotificationIOS from '@react-native-community/push-notification-ios'

const useShortcutBadge = () => {
  const isIOS = React.useMemo(() => Platform.OS === 'ios', [])

  const onGetBadge = React.useCallback(
    callback => {
      if (isIOS) {
        PushNotificationIOS.getApplicationIconBadgeNumber(count =>
          callback(count)
        )

        return
      }

      Shortcut.getCount(count => callback(count))
    },
    [isIOS]
  )

  const setBadge = React.useCallback(
    count => {
      if (isIOS) {
        PushNotificationIOS.setApplicationIconBadgeNumber(count)

        return
      }

      Shortcut.setCount(count)
    },
    [isIOS]
  )
  const incrementBadge = React.useCallback(() => {
    onGetBadge(count => setBadge(count + 1))
  }, [isIOS])
  const decrementBadge = React.useCallback(() => {
    onGetBadge(count => setBadge(count - 1 < 0 ? 0 : count - 1))
  }, [isIOS])

  return {
    setBadge,
    incrementBadge,
    decrementBadge
  }
}

export default useShortcutBadge
