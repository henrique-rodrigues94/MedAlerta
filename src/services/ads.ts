import mobileAds, {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// TROCAR pelos IDs reais gerados no console do AdMob antes de publicar.
// Enquanto estiver testando, use TestIds para não correr risco de banimento
// da sua conta por clique acidental em anúncio real.
export const BANNER_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_ID_AQUI';
export const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_ID_AQUI';

export async function iniciarAds() {
  await mobileAds().initialize();
}

const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

/**
 * Mostra um intersticial em momentos "seguros" (ex: depois de salvar um
 * remédio). NUNCA chamar isso na tela de alarme - atrapalharia a pessoa
 * a tomar o remédio a tempo.
 */
export function mostrarInterstitialOcasional() {
  interstitial.load();
  const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial.show();
    unsubscribe();
  });
}

export { BannerAd, BannerAdSize };
