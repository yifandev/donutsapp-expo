import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

type Props = {
  control: Control<any>;
  error?: string;
  onChangeText?: (text: string) => void;
};

export default function EmailInput({ control, error, onChangeText }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            className={`
              flex-row items-center rounded-2xl px-4 h-14
              bg-secondary/10
              ${focused ? "border border-secondary" : ""}
            `}
          >
            {/* Icon */}
            <Entypo
              name="mail"
              size={20}
              color={focused ? "#C25322" : "#9CA3AF"}
            />

            {/* Input */}
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                onBlur();
              }}
              className="flex-1 ml-3 text-text text-base"
              onChangeText={(text) => {
                onChange(text); // untuk react-hook-form
                if (onChangeText) onChangeText(text); // untuk parent callback
              }}
            />
          </View>
        )}
      />

      {error && <Text className="text-red-500 text-xs mt-2 ml-2">{error}</Text>}
    </View>
  );
}
