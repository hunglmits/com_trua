// import analytics from '@react-native-firebase/analytics'
import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { WebView } from "react-native-webview";

const ZweiWebview = () => {
  const [deviceToken, setDeviceToken] = useState("");
  return (
    <WebView
      source={{
        uri: `https://zwei-test:MsVfM7aVBf@dev.zwei-test.com/members/sign_in?device_token=${deviceToken}`,
      }}
      style={styles.webview}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    marginTop: 25,
    marginBottom: 20,
  },
});

export default React.memo(ZweiWebview);
