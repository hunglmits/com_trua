/**
 * @format
 */

import { AppRegistry } from "react-native";
import AppWrappedInCodePush from "./AppWrappedInCodePush";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => AppWrappedInCodePush);
