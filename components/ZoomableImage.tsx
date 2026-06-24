import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";

type Props = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  placeholder?: string; // emoji de rezervă dacă nu există poză
  accessibilityLabel?: string;
};

export default function ZoomableImage({
  uri,
  style,
  placeholder = "🥫",
  accessibilityLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const zoom = useRef(new Animated.Value(0)).current;

  function openZoom() {
    if (!uri) return;
    setOpen(true);
    zoom.setValue(0);
    Animated.spring(zoom, {
      toValue: 1,
      friction: 6,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }

  function closeZoom() {
    Animated.timing(zoom, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => setOpen(false));
  }

  const scale = zoom.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const rotate = zoom.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "0deg"] });

  return (
    <>
      <TouchableOpacity
        onPress={openZoom}
        disabled={!uri}
        accessibilityRole="imagebutton"
        accessibilityLabel={accessibilityLabel}
      >
        {uri ? (
          <Image source={{ uri }} style={style} resizeMode="contain" />
        ) : (
          <View style={[style, styles.placeholder]}>
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <Modal visible transparent animationType="none" onRequestClose={closeZoom}>
          <Animated.View style={[styles.overlay, { opacity: zoom }]}>
            <Pressable style={styles.backdrop} onPress={closeZoom} />
            <Animated.Image
              source={{ uri }}
              style={[styles.image, { transform: [{ scale }, { rotate }] }]}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.close} onPress={closeZoom}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },
  placeholderText: { fontSize: 22 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  image: { width: "88%", height: "70%" },
  close: {
    position: "absolute",
    top: 50,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#FFF", fontSize: 22, fontWeight: "700" },
});
