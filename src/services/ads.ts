import mobileAds, {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

export const BANNER_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_ID_AQUI';
export const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_ID_AQUI';

export async function iniciarAds() {
  await mobileAds().initialize();
}

const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

export function mostrarInterstitialOcasional() {
  interstitial.load();
  const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial.show();
    unsubscribe();
  });
}

export { BannerAd, BannerAdSize };
