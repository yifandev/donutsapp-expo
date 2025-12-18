import { Image, TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = {
  type: "github" | "google" | "apple";
} & TouchableOpacityProps;

const icons = {
  github: require("../../assets/images/github.png"),
  google: require("../../assets/images/google.png"),
  apple: require("../../assets/images/apple.png"),
};

export default function SocialButton({ type, ...props }: Props) {
  return (
    <TouchableOpacity
      className="w-14 h-14 rounded-full bg-white items-center justify-center shadow"
      {...props}
    >
      <Image source={icons[type]} className="w-6 h-6" resizeMode="contain" />
    </TouchableOpacity>
  );
}
