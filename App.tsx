import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";

export default function App() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasFaceID, setHasFaceID] = useState(false);

  const fallBackToDefaultAuth = () => {
    console.log("Fallback para autenticação padrão (senha)");
  };

  const alertComponet = (
    title: string,
    message: string,
    btnText: string,
    btnFunc: () => void
  ) => {
    return Alert.alert(title, message, [{ text: btnText, onPress: btnFunc }]);
  };

  const TwoButtonAlert = () => {
    return Alert.alert("Você está logado", "Deseja continuar?", [
      {
        text: "Sim",
        onPress: () => console.log("Sim pressionado"),
      },
      {
        text: "Não",
        onPress: () => console.log("Não pressionado"),
        style: "cancel",
      },
    ]);
  };

  const handleBiometricAuth = async () => {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

    if (!isBiometricAvailable) {
      return alertComponet(
        "Erro",
        "Seu dispositivo não suporta autenticação biométrica.",
        "OK",
        () => fallBackToDefaultAuth()
      );
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      return alertComponet(
        "Autenticação biométrica",
        "Nenhuma biometria configurada. Ative o Face ID ou Touch ID nas configurações do dispositivo.",
        "OK",
        () => fallBackToDefaultAuth()
      );
    }

    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage:
        Platform.OS === "ios" && hasFaceID
          ? "Use o Face ID para autenticar"
          : "Autenticação biométrica",
      fallbackLabel: "Usar senha",
      // No iOS, deve estar ausente ou `false` para permitir Face ID
      ...(Platform.OS === "android" ? { disableDeviceFallback: true } : {}),
    });

    if (biometricAuth.success) {
      TwoButtonAlert();
    } else {
      alertComponet(
        "Falha!!!",
        "Autenticação não realizada com sucesso.",
        "OK",
        () => console.log("Autenticação falhou.")
      );
    }
  };

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(isSupported);

      if (isSupported) {
        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

        // 2 = Face ID no iOS
        if (Platform.OS === "ios" && types.includes(2)) {
          setHasFaceID(true);
        }
      }
    };

    checkBiometricSupport();
  }, []);

  return (
    <View style={tw`flex-1 bg-white items-center justify-center`}>
      <View style={tw`mb-[100px]`}>
        <Text style={tw`text-center text-lg`}>Bem-vindo ao Aplicativo</Text>
      </View>

      <Text style={tw`text-center mb-4 text-gray-500`}>
        {isBiometricSupported
          ? hasFaceID
            ? "Seu dispositivo suporta Face ID."
            : "Seu dispositivo suporta autenticação biométrica."
          : "Seu dispositivo não suporta autenticação biométrica."}
      </Text>

      <View style={tw`flex flex-col items-center gap-8`}>
        <TouchableOpacity style={tw`bg-blue-500 px-4 py-2 rounded`}>
          <Text style={tw`text-white`}>Login com senha</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBiometricAuth}>
          <Entypo name="fingerprint" size={48} color="black" />
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
