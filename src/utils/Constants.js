// Dimensions
import { Platform, Dimensions } from "react-native";

// Check Iphone mode
export const isIphoneX = () => {
  const dimen = Dimensions.get("window");
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 || dimen.width === 812)
  );
};

export const isIphoneXsMax = () => {
  const dimen = Dimensions.get("window");
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 896 || dimen.width === 896)
  );
};

export const isBunnyEar = () => {
  const dimen = Dimensions.get("window");
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 896 || //iphone 11, iphone xsmax, iphone 11pro max
      dimen.width === 896 ||
      dimen.height === 812 || //iphone x, iphone 11pro, iphone 12mini
      dimen.width === 812 ||
      dimen.height === 844 || //iphone 12, iphone 12pro
      dimen.width === 844 ||
      dimen.height === 926 || //iphone 12pro max
      dimen.width === 926)
  );
};

const getNavPadding = () => {
  if (isBunnyEar()) return 40;
  if (Platform.OS === "ios") return 20;

  return 0;
};

export default {
  layout: {
    screenWidth: Dimensions.get("window").width,
    screenHeight: Dimensions.get("window").height,
    navPadding: getNavPadding(),
  },
};
