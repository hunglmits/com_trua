import React from "react";
import codePush from "react-native-code-push";
import App from "./App";

const AppWrappedInCodePush = () => {
  const componentDidMount = React.useCallback(() => {
    codePush.notifyAppReady();
    codePush.disallowRestart();
    codePush.sync(
      {
        installMode: codePush.InstallMode.IMMEDIATE,
        mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
        checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
        updateDialog: false,
      },
      (status) => {
        if (
          (status === codePush.SyncStatus.UPDATE_INSTALLED,
          codePush.SyncStatus.UPDATE_INSTALLED)
        ) {
          codePush.restartApp(true);
        }
      }
    );
  }, []);

  React.useEffect(() => {
    componentDidMount();
  }, []);

  return <App />;
};

const options = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
};

export default codePush(options)(AppWrappedInCodePush);
