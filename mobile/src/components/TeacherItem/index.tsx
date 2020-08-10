import React, { useCallback, useState } from "react";
import { View, Text, Image, Linking } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-community/async-storage";

import heartOutlineIcon from "../../assets/images/icons/heart-outline.png";
import unfavoriteIcon from "../../assets/images/icons/unfavorite.png";
import whatsappIcon from "../../assets/images/icons/whatsapp.png";

import api from "../../services/api";

import styles from "./styles";

export interface Teacher {
  id: number;
  avatar: string;
  bio: string;
  cost: number;
  name: string;
  subject: string;
  whatsapp: string;
}

interface TeacherItemProps {
  teacher: Teacher;
  favorite: boolean;
}

const TeacherItem: React.FC<TeacherItemProps> = ({ teacher, favorite }) => {
  const [isFavorite, setIsFavorite] = useState(favorite);

  const handleLinkToWhatsapp = useCallback(() => {
    api.post("connections", {
      user_id: teacher.id,
    });

    Linking.openURL(`whatsapp://send?phone=${teacher.whatsapp}`);
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    const favoritesFromStorage = await AsyncStorage.getItem("favorites");

    let favoritesArray = [];

    if (favoritesFromStorage) {
      favoritesArray = JSON.parse(favoritesFromStorage);
    }

    if (isFavorite) {
      const favoriteIndex = favoritesArray.findIndex((teacherItem: Teacher) => {
        return teacherItem.id === teacher.id;
      });

      favoritesArray.splice(favoriteIndex, 1);

      setIsFavorite(false);
    } else {
      favoritesArray.push(teacher);

      setIsFavorite(true);
    }

    await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Image source={{ uri: teacher.avatar }} style={styles.avatar} />

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{teacher.name}</Text>
          <Text style={styles.subject}>{teacher.subject}</Text>
        </View>
      </View>

      <Text style={styles.bio}>{teacher.bio}</Text>

      <View style={styles.footer}>
        <Text style={styles.price}>
          Preço/hora {"   "}
          <Text style={styles.priceValue}>R$ {teacher.cost}</Text>
        </Text>

        <View style={styles.buttonsContainer}>
          <RectButton
            onPress={handleToggleFavorite}
            style={[styles.favoriteButton, isFavorite ? styles.favorite : {}]}
          >
            {isFavorite ? (
              <Image source={unfavoriteIcon} />
            ) : (
              <Image source={heartOutlineIcon} />
            )}
          </RectButton>

          <RectButton
            onPress={handleLinkToWhatsapp}
            style={styles.contactButton}
          >
            <Image source={whatsappIcon} />
            <Text style={styles.contactButtonText}>Entrar em contato</Text>
          </RectButton>
        </View>
      </View>
    </View>
  );
};

export default TeacherItem;
